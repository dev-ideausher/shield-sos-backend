const express = require("express");
const router = express.Router();

const validate = require("../../middlewares/validate");
const { firebaseAuth, restrictTo } = require("../../middlewares/firebaseAuth");
const authValidation = require("../../validations/auth.validation");

const { authController } = require("../../controllers");

router.post("/login", authController.loginUser);
router.post("/register", validate(authValidation.register), firebaseAuth(), authController.registerUser);
// router.post("/superadmin-register", authController.registerSuperAdmin);
router.post("/admin-register", firebaseAuth(), restrictTo('superadmin'), authController.registerAdmin);
router.post("/super-distributor-register", firebaseAuth(), restrictTo('admin'), authController.registerSuperDistributor);
router.post("/distributor-register", firebaseAuth(), restrictTo('admin', 'super_distributor'), authController.registerDistributor);
router.post("/retailer-register", firebaseAuth(), restrictTo('admin', 'super_distributor', "distributor"), authController.registerRetailer);

module.exports = router;