const mongoose = require("mongoose");
const { paginate } = require('./plugins/paginate');

const emergencyContactSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        firstname: {
            type: String,
            trim: true,
            required: true,
        },
        lastname: {
            type: String,
            trip: true,
            default: ""
        },
        phoneCode: {
            type: String,
            default: "+1"
        },
        phoneNumber: {
            type: String,
            default: ""
        }

    },
    { timestamps: true }
);

emergencyContactSchema.plugin(paginate);

module.exports.EmergencyContact = mongoose.model("EmergencyContact", emergencyContactSchema, "EmergencyContact");
