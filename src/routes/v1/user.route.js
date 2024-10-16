const express = require("express");
const router = express.Router();

const validate = require("../../middlewares/validate");
const { firebaseAuth, restrictTo } = require("../../middlewares/firebaseAuth");
const userValidation = require("../../validations/user.validation");

const { userController } = require("../../controllers");
const { fileUploadService } = require("../../microservices");

// Multer middleware for file uploads
const upload = fileUploadService.multerUpload.fields([
    { name: 'kycCardFile', maxCount: 1 },
    { name: 'cancelledChequeFile', maxCount: 1 },
    { name: "passportSizeImageFile", maxCount: 1 },
    { name: "profilePic", maxCount: 1 },
]);

// for updating userDetails
router.patch("/updateDetails",
    validate(userValidation.updateUser),
    firebaseAuth(),
    userController.updateUser
);

// for updating specific user preferences
router.patch("/updatePreferences",
    validate(userValidation.updateUserPreferences),
    firebaseAuth(),
    userController.updateUserPreferences
)

// for deleting a user
router.delete("/:userId",
    validate(userValidation.deleteUser),
    firebaseAuth(),
    userController.deleteUser
);

router.patch("/:userId/update",
    firebaseAuth(),
    upload,
    userController.updateUserById
);

router.get("/:id/get",
    firebaseAuth(),
    userController.getUserById
);

router.get("/all/data",
    firebaseAuth(),
    restrictTo('superadmin'),
    userController.getAllUsersData
);

router.get("/all",
    firebaseAuth(),
    restrictTo('superadmin', 'admin', 'super_distributor', 'distributor'),
    userController.getAllUsers
);

router.post("/change-password",
    firebaseAuth(),
    userController.changePassword
);

router.post("/:userId/reset-password",
    firebaseAuth(),
    restrictTo('superadmin', 'admin', 'super_distributor'),
    userController.resetPassword
);

module.exports = router;