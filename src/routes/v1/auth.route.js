const express = require("express");
const router = express.Router();

const validate = require("../../middlewares/validate");
const { firebaseAuth, restrictTo, generateToken } = require("../../middlewares/firebaseAuth");
const authValidation = require("../../validations/auth.validation");

const { authController } = require("../../controllers");

router.post("/login", authController.loginUser);
router.post("/register", validate(authValidation.register), firebaseAuth(), authController.registerUser);

router.post("/generate-token/:uid", generateToken);

module.exports = router;