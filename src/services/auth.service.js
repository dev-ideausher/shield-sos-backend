const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

async function createUser(user) {
    return await User.create(user);
}

async function getUserByFirebaseUId(id) {
    return await User.findOne({ firebaseUid: id });
}

async function getUserByEmail(email) {
    const user = await User.findOne({ email });
    return user;
}

module.exports = {
    createUser,
    getUserByFirebaseUId,
    getUserByEmail
}