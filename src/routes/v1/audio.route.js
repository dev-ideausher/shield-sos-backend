const express = require('express');
const router = express.Router();
const { audioController } = require('../../controllers');

router.get(
    '/:filename',
    audioController.getAudioFile
);
module.exports = router;
