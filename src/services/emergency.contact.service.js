const { EmergencyContact } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');


async function createEmergencyContact(contact) {
    return await EmergencyContact.create(contact);
}

async function updateEmergencyContactById(id, updateData) {
    return EmergencyContact.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).then(doc => {
        if (!doc) {
            throw new ApiError(httpStatus.NOT_FOUND, 'EmergencyContact not found');
        }
        return doc;
    });
}

async function deleteEmergencyById(contactId) {
    return await EmergencyContact.findByIdAndDelete(contactId);
}

async function getEmergencyById(contactId) {
    return await EmergencyContact.findById(contactId);
}

async function getEmergencyContacts(filters, options) {
    return EmergencyContact.paginate(filters, options);
}

module.exports = {
    createEmergencyContact,
    updateEmergencyContactById,
    deleteEmergencyById,
    getEmergencyById,
    getEmergencyContacts
};
