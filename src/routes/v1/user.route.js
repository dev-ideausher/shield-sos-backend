const express = require("express");
const router = express.Router();

const validate = require("../../middlewares/validate");
const { firebaseAuth, restrictTo } = require("../../middlewares/firebaseAuth");
const userValidation = require("../../validations/user.validation");

const { userController } = require("../../controllers");
const { fileUploadService } = require("../../microservices");


// for updating userDetails
router.patch("/update-me",
    firebaseAuth(),
    fileUploadService.multerUpload.single('profilePic'),
    userController.updateUser
);

// for updating userDetails
router.get("/me",
    firebaseAuth(),
    userController.getUserDetails
);

// for deleting a user
router.delete("/:userId",
    validate(userValidation.deleteUser),
    firebaseAuth(),
    userController.deleteUser
);

router.patch("/:userId/update",
    firebaseAuth(),
    restrictTo('Admin'),
    fileUploadService.multerUpload.single('profilePic'),
    userController.updateUserByAdmin
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

module.exports = router;