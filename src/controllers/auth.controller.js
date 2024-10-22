const catchAsync = require("../utils/catchAsync");
const { encryptText, decryptText } = require('../utils/encrypt');
const { userService, permissionService, authService } = require('../services');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const { BankAccount, Document } = require("../models")

const loginUser = catchAsync(async (req, res) => {
    res.status(200).send({ data: req.user });
});

const registerUser = catchAsync(async (req, res) => {
    if (req.user) {
        res.status(401).send({ message: "User already exist" });
    } else {
        if (req.newUser.firebase.sign_in_provider === "phone") {
            userObj = { phone: req.newUser.phone_number, ...req.body }
        } else {
            userObj = {
                name: req.newUser.name,
                email: req.newUser.email,
                profilePic: req.newUser.picture,
                ...req.body
            }
        }
        userObj = {
            ...userObj,
            firebaseUid: req.newUser.uid,
            firebaseSignInProvider: req.newUser.firebase.sign_in_provider
        }
        const user = await authService.createUser(userObj);
        res.status(201).send({ data: user });
    }
});

const registerSuperAdmin = catchAsync(async (req, res) => {
    let { username, email, password, permissions } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({
            status: false,
            message: "Please pass email,username and password"
        })
    }

    let checkUser = await userService.getUserByEmail(email)
    if (checkUser) {
        return res.status(400).json({
            status: false,
            message: "An user already exist with this email"
        })
    }
    let checkUsername = await userService.getUserByUsername(username);
    if (checkUsername) {
        return res.status(400).json({
            status: false,
            message: "An user already exist with this username"
        })
    }

    const encryptedPass = encryptText(password, config.password_secret_key);
    try {
        const superadmin = await authService.createUser({
            email,
            username,
            role: 'superadmin',
            active: true,
            password: encryptedPass
        });
        //add permissions
        await permissionService.addPermission({ ...permissions, user: superadmin._id });
        return res.status(200).json({
            status: true,
            message: 'Sub admin added successfully',
            data: superadmin,
        })
    } catch (error) {
        console.log("subadin create error", error)
        return res.status(401).json({
            status: false,
            message: error.message
        })
    }

});

const registerAdmin = catchAsync(async (req, res) => {
    let { username, email, password, permissions } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({
            status: false,
            message: "Please pass email,username and password"
        })
    }

    let checkUser = await userService.getUserByEmail(email)
    if (checkUser) {
        return res.status(400).json({
            status: false,
            message: "An user already exist with this email"
        })
    }
    let checkUsername = await userService.getUserByUsername(username);
    if (checkUsername) {
        return res.status(400).json({
            status: false,
            message: "An user already exist with this username"
        })
    }
    const encryptedPass = encryptText(password, config.password_secret_key);
    try {
        const admin = await authService.createUser({
            email,
            username,
            role: 'admin',
            active: true,
            password: encryptedPass
        });
        await permissionService.addPermission({ ...permissions, user: admin._id });
        return res.status(200).json({
            status: true,
            message: 'Admin added successfully',
            data: admin,
        })
    } catch (error) {
        console.log("Admin create error", error)
        return res.status(401).json({
            status: false,
            message: error.message
        })
    }

});

const registerSuperDistributor = catchAsync(async (req, res) => {
    const user = req.user;
    let { username, email, password, permissions } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({
            status: false,
            message: "Please pass email,username and password"
        })
    }

    let checkUser = await userService.getUserByEmail(email)
    if (checkUser) {
        return res.status(400).json({
            status: false,
            message: "An user already exist with this email"
        })
    }
    let checkUsername = await userService.getUserByUsername(username);
    if (checkUsername) {
        return res.status(400).json({
            status: false,
            message: "An user already exist with this username"
        })
    }
    const encryptedPass = encryptText(password, config.password_secret_key);
    try {
        const superDistributor = await authService.createUser({
            email,
            username,
            role: 'super_distributor',
            active: true,
            password: encryptedPass,
            admin: user._id
        });
        await permissionService.addPermission({ ...permissions, user: superDistributor._id });
        await BankAccount.create({
            user: superDistributor._id
        })
        await Document.create({
            user: superDistributor._id
        })
        return res.status(200).json({
            status: true,
            message: 'Super Distributor added successfully',
            data: superDistributor,
        })
    } catch (error) {
        console.log("Super Distributor create error", error)
        return res.status(401).json({
            status: false,
            message: error.message
        })
    }

});

const registerDistributor = catchAsync(async (req, res) => {
    const user = req.user;
    let { username, email, password, permissions, superDistributor } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({
            status: false,
            message: "Please pass email,username and password"
        })
    }

    let checkUser = await userService.getUserByEmail(email)
    if (checkUser) {
        return res.status(400).json({
            status: false,
            message: "An user already exist with this email"
        })
    }
    let checkUsername = await userService.getUserByUsername(username);
    if (checkUsername) {
        return res.status(400).json({
            status: false,
            message: "An user already exist with this username"
        })
    }
    if (!superDistributor && user.role === "super_distributor") {
        superDistributor = user._id
    }

    if (!superDistributor) {
        return res.status(400).json({
            status: false,
            message: "Please pass super distributor"
        })
    }
    let superDis = await userService.getUserById(superDistributor);
    if (!superDis) {
        return res.status(400).json({
            status: false,
            message: "Super distributor not found"
        })
    }
    const encryptedPass = encryptText(password, config.password_secret_key);
    try {
        const distributor = await authService.createUser({
            email,
            username,
            role: 'distributor',
            active: true,
            password: encryptedPass,
            admin: superDis.admin,
            superDistributor: superDis._id
        });
        await permissionService.addPermission({ ...permissions, user: distributor._id });
        await BankAccount.create({
            user: distributor._id
        })
        await Document.create({
            user: distributor._id
        })
        return res.status(200).json({
            status: true,
            message: 'Distributor added successfully',
            data: distributor,
        })
    } catch (error) {
        console.log("Distributor create error", error)
        return res.status(401).json({
            status: false,
            message: error.message
        })
    }

});

const registerRetailer = catchAsync(async (req, res) => {
    const user = req.user;
    let { username, email, password, permissions, superDistributor, distributor } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({
            status: false,
            message: "Please pass email,username and password"
        })
    }

    let checkUser = await userService.getUserByEmail(email)
    if (checkUser) {
        return res.status(400).json({
            status: false,
            message: "An user already exist with this email"
        })
    }
    let checkUsername = await userService.getUserByUsername(username);
    if (checkUsername) {
        return res.status(400).json({
            status: false,
            message: "An user already exist with this username"
        })
    }
    if (user.role === "admin") {
        if (!superDistributor) {
            return res.status(400).json({
                status: false,
                message: "Please pass super distributor"
            })
        }
        if (!distributor) {
            return res.status(400).json({
                status: false,
                message: "Please pass distributor"
            })
        }
    } else if (user.role === 'super_distributor') {
        if (!distributor) {
            return res.status(400).json({
                status: false,
                message: "Please pass distributor"
            })
        }
        superDistributor = user._id;
    } else if (user.role === "distributor") {
        distributor = user._id
    }

    if (!distributor) {
        return res.status(400).json({
            status: false,
            message: "Please pass distributor"
        })
    }
    let dis = await userService.getUserById(distributor);
    if (!dis) {
        return res.status(400).json({
            status: false,
            message: "Distributor not found"
        })
    }
    const encryptedPass = encryptText(password, config.password_secret_key);
    try {
        const retailer = await authService.createUser({
            email,
            username,
            role: 'retailer',
            active: true,
            password: encryptedPass,
            admin: dis.admin,
            superDistributor: dis.superDistributor,
            distributor: dis._id
        });
        await permissionService.addPermission({ ...permissions, user: retailer._id });
        await BankAccount.create({
            user: retailer._id
        })
        await Document.create({
            user: retailer._id
        })
        return res.status(200).json({
            status: true,
            message: 'Retailer added successfully',
            data: retailer,
        })
    } catch (error) {
        console.log("Retailer create error", error)
        return res.status(401).json({
            status: false,
            message: error.message
        })
    }

});

module.exports = {
    loginUser,
    registerUser,
    registerSuperAdmin,
    registerAdmin,
    registerSuperDistributor,
    registerDistributor,
    registerRetailer
}