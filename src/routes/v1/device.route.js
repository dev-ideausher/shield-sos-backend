const express = require('express');
const router = express.Router();
const { deviceController } = require('../../controllers');
const { firebaseAuth } = require('../../middlewares/firebaseAuth');

router.post(
    '/',
    // firebaseAuth(),
    // shield.checkOwnership,
    deviceController.createDevice
);

router.patch(
    '/:deviceId',
    // firebaseAuth(),
    // shield.checkOwnership,
    deviceController.updateDevice
);

router.delete(
    '/:deviceId',
    firebaseAuth(),
    // shield.checkOwnership,
    deviceController.deleteDevice
);

module.exports = router;
