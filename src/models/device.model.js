const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
    {
        place: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Place",
            required: true
        },
        name: {
            type: String,
            trim: true,
            required: true,
        },
        deviceId: {
            type: String,
            required: true,
        },
        macAddress: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        thingId: {
            type: String,
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

module.exports.Device = mongoose.model('Device', deviceSchema, "Device");
