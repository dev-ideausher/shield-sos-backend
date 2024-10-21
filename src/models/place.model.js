const mongoose = require('mongoose');
const { paginate } = require('./plugins/paginate');

const placeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        locationInWords: {
            type: String,
            required: true,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        thumbnail: {
            type: {
                key: String,
                url: String,
            },
            required: true,
        },
        mediaLinks: {
            type: [
                {
                    key: String,
                    url: String,
                },
            ],
            default: [],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        devices: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Device',
            default: [],
        },
    },
    { timestamps: true }
);

placeSchema.plugin(paginate);

module.exports.Place = mongoose.model('Place', placeSchema, 'Place');
