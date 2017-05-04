var mongoose = require('mongoose');
var shortid = require('shortid');
var Schema = mongoose.Schema;

var CampaignSchema = new Schema({
    _id: { type: String, index: { unique: true }, 'default': shortid.generate },
    title: { type: String, required: true, trim: true },
    script: { type: String, trim: true },
    thank_you: {type: String, trim: true},
    learn_more: {type: String, trim: true},
    publish: {type: Boolean, trim: true},
    influencer: {type: String, trim: false}
},
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        },
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    });

// static methods
CampaignSchema.statics.findForRequestingUser = function(campaignId, requestUserId) {
    return this.findOne({_id: campaignId})
        .then((campaign) => {
            if (!campaign) {
                return null;
            }
            // if campaign is not published, only return to owner of campaign
            if (!campaign.publish && campaign.influencer !== requestUserId) {
                return null;
            }
            return campaign;
        });
};

CampaignSchema.statics.findByTitleAndUser = function(title, influencerId) {
    return this.find({title: title, influencer: influencerId});
};

CampaignSchema.statics.findByUser = function(influencerId, sort) {
    let allowedSortOptions = ['createdAt', '-createdAt'];
    if (allowedSortOptions.indexOf(sort) === -1) {
        sort = '-createdAt';
    }
    return this.find({influencer: influencerId}).sort(sort);
};

// instance methods
CampaignSchema.methods.delete = function(userId) {
    return new Promise((resolve, reject) => {
        if (this.influencer === userId) {
            resolve(this.remove());
        } else {
            console.log('unauthorized delete');
            reject(new Error('Cannot delete campaign belonging to other users.'));
        }
    });
};

CampaignSchema.virtual('url').get(function() {
    return `/${this._id}`;
});

var Campaign = mongoose.model('Campaign', CampaignSchema);

module.exports = Campaign;
