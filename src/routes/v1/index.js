const express = require("express");
const router = express.Router();

const userRoute = require("./user.route");
const authRoute = require("./auth.route");
const placeRoute = require("./place.route");
const deviceRoute = require("./device.route");

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/places", placeRoute);
router.use("/devices", deviceRoute);


module.exports = router;