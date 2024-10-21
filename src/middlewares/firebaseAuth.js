const admin = require("firebase-admin");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
const { getAuth, signInWithCustomToken } = require("firebase/auth");
// require("../../firebase-web");

// const serviceAccount = require("../../firebase-service-secret.json");
const { userService, authService } = require("../services");

admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(config.firebase_secret))
})


const firebaseAuth = () => async (req, res, next) => {
    return new Promise(async (resolve, reject) => {

        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // const token = req.headers.token;
        // token not found
        if (!token) { reject(new ApiError(httpStatus.BAD_REQUEST, "Please Authenticate!")); }
        try {
            const payload = await admin.auth().verifyIdToken(token, true);
            const user = await authService.getUserByFirebaseUId(payload.uid);
            if (!user) {
                if (req.path === "/register") {
                    req.newUser = payload;
                } else reject(new ApiError(httpStatus.NOT_FOUND, "User doesn't exist. Please create account"));
            } else {
                if (!user.active) { throw new ApiError(httpStatus.FORBIDDEN, "User is blocked"); }
                if (user.isDeleted) { throw new ApiError(httpStatus.FORBIDDEN, "User is deleted"); }

                req.user = user;
            }

            resolve();
        } catch (err) {
            console.log("FirebaseAuthError:", err);
            reject(new ApiError(httpStatus.UNAUTHORIZED, "Failed to authenticate"))
        }
    }).then(() => next()).catch((err) => next(err));
}

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission ot perform this action');
        }
        next();
    }
};

//Only for backend developer to generate token to call APIS
const generateToken = async (req, res, next) => {

    try {
        const token = await admin.auth().createCustomToken(req.params.uid);
        const user = await signInWithCustomToken(getAuth(), token);
        const idToken = user._tokenResponse.idToken
        return res.status(200).json({
            status: true,
            token: idToken
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            msg: err.message
        })
    }
}

const deleteFirebaseUser = async (uid) => {
    let duser = await admin.auth().deleteUser(uid).then(function () {
        console.log('Successfully deleted user');
        return true
    })
        .catch(function (error) {
            console.log('Error deleting user:', error);
            return false

        });
    return duser;
}

module.exports = {
    firebaseAuth,
    generateToken,
    deleteFirebaseUser,
    restrictTo
}