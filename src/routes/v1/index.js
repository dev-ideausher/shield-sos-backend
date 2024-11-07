const express = require("express");
const router = express.Router();

const userRoute = require("./user.route");
const authRoute = require("./auth.route");
const placeRoute = require("./place.route");
const deviceRoute = require("./device.route");
const audioRoute = require("./audio.route");

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/places", placeRoute);
router.use("/devices", deviceRoute);
router.use("/audio", audioRoute);


module.exports = router;