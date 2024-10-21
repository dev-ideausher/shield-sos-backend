const mongoose = require("mongoose");
const { paginate } = require("./plugins/paginate");
const { userRoles } = require("../constants");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "",
        trim: true,
    },
    phone: {
        type: String,
        default: "",
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    profilePic: {
        type: {
            key: String,
            url: String,
        },
        default: null,
    },
    role: {
        type: String,
        enum: userRoles,
        default: "user"
    },
    firebaseUid: {
        type: String,
        required: true
    },
    firebaseSignInProvider: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deleteReason: {
        type: String,
        default: ""
    },
    active: {
        type: Boolean,
        default: true
    }
},
    { timestamps: true }
);

userSchema.plugin(paginate);

module.exports.User = mongoose.model("User", userSchema, "User");