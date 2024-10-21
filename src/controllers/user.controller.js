const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService, permissionService, walletService } = require("../services");
const { searchQuery } = require('../utils/searchQuery');
const { encryptText, decryptText } = require('../utils/encrypt');
const config = require('../config/config');
const { fileUploadService } = require("../microservices")

const updateUser = catchAsync(async (req, res) => {
    const user = await userService.updateUserById(req.user._id, req.body, req.file);
    res.json({ status: true, message: "Your details are updated", data: user });
});

const updateUserByAdmin = catchAsync(async (req, res) => {
    const userCheck = await userService.getUserById(req.params.userId);
    if (!userCheck) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    const user = await userService.updateUserById(req.params.userId, req.body, req.file);
    res.json({ status: true, message: "Your details are updated", data: user });
});



const deleteUser = catchAsync(async (req, res) => {
    if (req.user.role === "user" && req.params.userId !== req.user._id.toString()) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Sorry, you are not authorized to do this");
    }
    await userService.deleteUserById(req.params.userId, req.body.reason);
    res.status(201).send({ message: "The user deletion process has been completed successfully." });
});

const updateUserById = catchAsync(async (req, res) => {
    const { permissions, document, bankAccount } = req.body;
    let doc = {}
    let ba = {}
    if (permissions) {
        delete req.body.permissions;
    }
    if (document) {
        doc = { ...doc, ...document }
        delete req.body.permissions;
    }
    if (bankAccount) {
        ba = { ...ba, ...bankAccount }
        delete req.body.permissions;
    }
    if (req.files['profilePic'] && req.files['profilePic'][0]) {
        let profilePic = await fileUploadService.s3Upload([req.files['profilePic'][0]], 'profiles');
        req.body.profilePic = profilePic[0].url
    }
    if (req.files['kycCardFile'] && req.files['kycCardFile'][0]) {
        let kyc = await fileUploadService.s3Upload([req.files['kycCardFile'][0]], 'kycFiles');
        doc.kycCard = kyc[0].url
    }
    if (req.files['cancelledChequeFile'] && req.files['cancelledChequeFile'][0]) {
        let cancelledCheque = await fileUploadService.s3Upload([req.files['cancelledChequeFile'][0]], 'cancelledChequeFiles');
        ba.cancelledChequeImage = cancelledCheque[0].url
    }
    if (req.files['passportSizeImageFile'] && req.files['passportSizeImageFile'][0]) {
        let passportSizeImage = await fileUploadService.s3Upload([req.files['passportSizeImageFile'][0]], 'passportSizeImageFiles');
        ba.passportSizeImage = passportSizeImage[0].url
    }
    let user = await userService.getUserById(req.params.userId);

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (req.body.username) {
        delete req.body.username;
    }
    if (req.body.email) {
        delete req.body.email;
    }
    if (req.body.password) {
        delete req.body.password;
    }
    user = await userService.updateUserById(user._id, req.body);
    await permissionService.updatePermissionByUserId(user._id, { ...permissions })
    await BankAccount.findOneAndUpdate({ user: user._id }, ba);
    await Document.findOneAndUpdate({ user: user._id }, doc);
    res.status(200).json({
        status: true,
        message: 'User updated successfully',
        data: user
    })

})

const getUserById = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.status(200).send({ status: true, message: "user details", data: user });
});

const getAllUsersData = catchAsync(async (req, res) => {
    if (req.query.search === '') {
        delete req.query.search;
    }
    if (req.query.search) {
        let search = req.query.search;
        delete req.query.search;
        let qStringName = searchQuery(search, "name");
        let qStringPhone = searchQuery(search, "phone");
        let qStringEmail = searchQuery(search, "email");
        let qStringUsername = searchQuery(search, "username");
        req.query = { ...req.query, $or: qStringName.concat(qStringPhone).concat(qStringEmail).concat(qStringUsername) }
    }
    const users = await userService.getAllUsers(req.query, [])

    res.status(200).json({
        status: true,
        message: 'All users',
        data: users
    })
})

const getAllUsers = catchAsync(async (req, res) => {
    const user = req.user;
    if (user.role === "admin") {
        req.query.admin = user._id;
    } else if (user.role === 'super_distributor') {
        req.query.superDistributor = user._id
    } else if (user.role === "distributor") {
        req.query.distributor = user._id
    }
    if (req.query.search === '') {
        delete req.query.search;
    }
    if (req.query.search) {
        let search = req.query.search;
        delete req.query.search;
        let qStringName = searchQuery(search, "name");
        let qStringPhone = searchQuery(search, "phone");
        let qStringEmail = searchQuery(search, "email");
        let qStringUsername = searchQuery(search, "username");
        req.query = { ...req.query, $or: qStringName.concat(qStringPhone).concat(qStringEmail).concat(qStringUsername) }
    }
    const users = await userService.getAllUsers(req.query, [])

    res.status(200).json({
        status: true,
        message: 'All users',
        data: users
    })
})

module.exports = {
    deleteUser,
    updateUser,
    updateUserById,
    getUserById,
    getAllUsersData,
    getAllUsers,
    updateUserByAdmin
}