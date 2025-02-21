const express = require('express');
const router = express.Router();
const { emergencyContactController } = require('../../controllers');
const { firebaseAuth } = require("../../middlewares/firebaseAuth");

router.post(
    '/',
    firebaseAuth(),
    emergencyContactController.createContact
);

router.get(
    '/',
    firebaseAuth(),
    emergencyContactController.getContacts
);

router.get(
    '/:contactId',
    firebaseAuth(),
    emergencyContactController.getContactById
);

router.patch(
    '/:contactId',
    firebaseAuth(),
    emergencyContactController.updateContact
);

router.delete(
    '/:contactId',
    firebaseAuth(),
    emergencyContactController.deleteContact
);
module.exports = router;
