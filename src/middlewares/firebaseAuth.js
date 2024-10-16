const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const config = require('../config/config');
const jwt = require('jsonwebtoken');

const { authService, accountService, deviceSessionService } = require("../services");

const firebaseAuth = () => async (req, res, next) => {
    return new Promise(async (resolve, reject) => {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({
                status: false,
                message: "You are unauthorized"
            })
        }
        token = req.headers.authorization.split(" ")[1]
        // token not found
        if (!token) { reject(new ApiError(httpStatus.BAD_REQUEST, "Please Authenticate!")); }
        try {
            const payload = jwt.verify(token, config.jwtSecret);
            const user = await authService.getUserByEmail(payload.email);
            if (!user) {
                if (req.path === "/register") {
                    req.newUser = payload;
                } else reject(new ApiError(httpStatus.NOT_FOUND, "User doesn't exist. Please create account"));
            } else {
                if (user.isBlocked) { throw new ApiError(httpStatus.FORBIDDEN, "User is blocked"); }
                req.user = user;
            }

            resolve();
        } catch (err) {
            console.log("FirebaseAuthError:", err.message);
            if (err?.name === "TokenExpiredError") {
                const decoded = jwt.decode(token);
                if (decoded.role === "user") {
                    let account = await accountService.getAccountByUserId(decoded.id);
                    const deviceId = req.headers['deviceid'];
                    let deviceSession = await deviceSessionService.getDeviceByUserId(decoded.id);
                    if (deviceSession && deviceSession.deviceId === deviceId) {
                        account.isLoggedOut = true;
                        await account.save()
                    }
                }

            }
            reject(new ApiError(httpStatus.UNAUTHORIZED, "Failed to authenticate"))
        }
    }).then(() => next()).catch((err) => next(err));
}

const generateCustomToken = () => async (req, res, next) => {
    return new Promise(async (resolve, reject) => {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({
                status: false,
                message: "You are unauthorized"
            });
        }
        token = req.headers.authorization.split(" ")[1];
        if (!token) {
            reject(new ApiError(httpStatus.BAD_REQUEST, "Please Authenticate!"));
        }
        try {
            const payload = jwt.verify(token, jwtSecret);
            const user = await authService.getUserByEmail(payload.email);
            if (!user) {
                if (req.path === "/register") {
                    req.newUser = payload;
                } else {
                    reject(new ApiError(httpStatus.NOT_FOUND, "User doesn't exist. Please create account"));
                }
            } else {
                if (user.isBlocked) {
                    throw new ApiError(httpStatus.FORBIDDEN, "User is blocked");
                }
                req.user = user;
                const customToken = jwt.sign({ id: user._id, email: payload.email, role: payload.role }, jwtSecret, { expiresIn: jwtExpiry });
                req.customToken = customToken;
            }

            resolve();
        } catch (err) {
            console.log("FirebaseAuthError:", err);
            reject(new ApiError(httpStatus.UNAUTHORIZED, "Failed to authenticate"));
        }
    }).then(() => next()).catch((err) => next(err));
};

const verifyCustomToken = () => async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'You are unauthorized'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await authService.getUserByEmail(decoded.email)
        req.user = user;
        next();
    } catch (err) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token'));
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission ot perform this action');
        }
        next();
    }
};

module.exports = {
    firebaseAuth,
    restrictTo,
    generateCustomToken,
    verifyCustomToken
}