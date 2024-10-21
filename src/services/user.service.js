const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { getAllData } = require("../utils/getAllData");
const { fileUploadService } = require("../microservices")


const userValidator = (user) => {
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
    } else if (user.isDeleted) {
        throw new ApiError(httpStatus.FORBIDDEN, "User account has been deleted.");
    } else if (user.isBlocked) {
        throw new ApiError(httpStatus.FORBIDDEN, "User has been blocked.");
    }
}

async function updateUserById(id, newDetails, profilePicture = null) {
    if (profilePicture) {
        const [profilePic] = await fileUploadService.s3Upload([profilePicture], 'profilePics');
        newDetails.profilePic = profilePic;
    }
    return User.findByIdAndUpdate(id, newDetails, {
        new: true,
    });
}

async function deleteUserById(id, reason) {
    try {
        const user = await User.findById(id);
        userValidator(user);
        user.isDeleted = true;
        user.deleteReason = reason;
        await user.save();
        return true;
    } catch (err) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to delete the user");
    }
}

async function updateUserPreferencesById(id, newPrefs) {
    const user = await User.findById(id);
    userValidator(user);
    Object.keys(newPrefs).map((key) => {
        user.preferences[key] = newPrefs[key];
    })
    await user.save();
    return user;
}

async function getUserByEmail(email) {
    const user = await User.findOne({ email });
    return user;
}

async function getUserByEmailOrUsername(identifier) {
    const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    });
    return user;
}

async function getUserByUsername(username) {
    const user = await User.findOne({ username });
    return user;
}

async function getUserById(id) {
    const user = await User.findById(id);
    return user;
}

async function getAllUsers(query, populateConfig) {
    const data = await getAllData(User, query, populateConfig)
    return data;
}


module.exports = {
    updateUserById,
    deleteUserById,
    updateUserPreferencesById,
    getUserByEmail,
    getUserByUsername,
    getUserByEmailOrUsername,
    getUserById,
    getAllUsers
}