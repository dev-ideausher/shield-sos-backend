const mongoose = require("mongoose");
const { paginate } = require("./plugins/paginate");
const { userRoles } = require("../constants");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "",
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
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
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: userRoles,
        default: "retailer"
    },
    password: {
        type: String,
        minlength: 6,
        required: true
    },
    dob: {
        type: String,
        default: ""
    },
    isProfileVerified: {
        type: Boolean,
        default: false
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    superDistributor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    distributor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    ip: {
        type: String,
        default: ""
    },
    pin: {
        type: String,
        default: ""
    },
    active: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

userSchema.plugin(paginate);

module.exports.User = mongoose.model("User", userSchema, "User");