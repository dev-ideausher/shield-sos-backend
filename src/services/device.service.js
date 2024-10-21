const { Device, Place } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const placeService = require('./place.service');

async function createDevice(placeId, deviceData) {
    return Device.create(deviceData).then(async doc => {
        await placeService.updatePlaceById(placeId, {
            $addToSet: { devices: doc._id },
        });
        return doc;
    });
}

async function updateDeviceById(id, updateData) {
    return Device.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).then(doc => {
        if (!doc) {
            throw new ApiError(httpStatus.NOT_FOUND, 'device not found');
        }
        return doc;
    });
}

async function deleteDeviceById(deviceId, placeId) {
    return Promise.all([
        Device.findByIdAndDelete(deviceId).then(doc => {
            if (!doc) {
                throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
            }
        }),
        placeService.removeDeviceFromPlaceById(placeId, deviceId),
    ]);
}

async function getDeviceById(deviceId) {
    return await Device.findById(deviceId);
}

async function getDevices(filters, options) {
    return Device.paginate(filters, options);
}

module.exports = {
    createDevice,
    updateDeviceById,
    deleteDeviceById,
    getDevices,
    getDeviceById
};
