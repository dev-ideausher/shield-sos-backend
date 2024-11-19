const express = require("express");
const router = express.Router();
const { deviceController } = require("../../controllers");
const { firebaseAuth } = require("../../middlewares/firebaseAuth");

router.post(
  "/",
  // firebaseAuth(),
  // shield.checkOwnership,
  deviceController.iotDevices
);

router.post(
  "/create",
  firebaseAuth(),
  shield.checkOwnership,
  deviceController.createDevice
);

router.post(
  "/:deviceId/update",
  firebaseAuth(),
  // shield.checkOwnership,
  deviceController.updateDevice
);

router.post(
  "/:deviceId",
  // firebaseAuth(),
  // shield.checkOwnership,
  deviceController.updateIOTDevice
);

router.delete(
  "/:deviceId",
  firebaseAuth(),
  // shield.checkOwnership,
  deviceController.deleteDevice
);

module.exports = router;
