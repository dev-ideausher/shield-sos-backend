const httpStatus = require('http-status');
const { emergencyContactService } = require('../services');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { getPaginateConfig } = require('../utils/queryPHandler');

const createContact = catchAsync(async (req, res) => {
    const contact = await emergencyContactService.createEmergencyContact({ ...req.body, user: req.user._id });

    res.status(201).send({ status: true, message: "Emergency contact added successfully", data: contact });
});

const updateContact = catchAsync(async (req, res) => {
    const id = req.params.contactId;
    const contact = await emergencyContactService.updateEmergencyContactById(id, req.body)
    res.json({ status: true, message: "Emergency contact updated successfully", data: contact });
});

const deleteContact = catchAsync(async (req, res) => {
    const { contactId } = req.params;
    const data = await emergencyContactService.deleteEmergencyById(contactId);
    res.status(200).json({
        status: true,
        message: "Emergency contact delete successfully"
    })
});

const getContacts = catchAsync(async (req, res) => {
    const { filters, options } = getPaginateConfig(req.query);
    if (req.user.role === 'user') {
        filters.user = req.user._id;
    }
    const data = await emergencyContactService.getEmergencyContacts(filters, options);
    res.json({ status: true, message: "Emergency contacts", data });
});

const getContactById = catchAsync(async (req, res) => {
    const { contactId } = req.params;
    const contact = await emergencyContactService.getEmergencyById(contactId)
    res.json({ status: true, message: "Contact details", data: contact });
});

module.exports = { createContact, updateContact, deleteContact, getContacts, getContactById };
