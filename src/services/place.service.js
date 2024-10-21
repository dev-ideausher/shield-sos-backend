const { Place } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { fileUploadService } = require('../microservices');
const { eventEmitter } = require('../models/eventEmitter');
const { events } = require('../constants');

async function createPlace(data, thumbnailFile, images = []) {
    if (images.length > 0) {
        data.mediaLinks = await fileUploadService.s3Upload(images, 'shieldPlaces');
    }
    const [thumbnail] = await fileUploadService.s3Upload(thumbnailFile, 'shieldThumbnails');
    data.thumbnail = thumbnail;
    return Place.create(data);
}

async function getPlaceById(placeId, populateDevices = false) {
    const place = await (populateDevices ? Place.findById(placeId).populate('devices') : Place.findById(placeId));
    if (!place) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
    }
    return place;
}

async function updatePlaceById(placeId, updateData, thumbnail = null, images = []) {
    if (images.length > 0) {
        updateData.mediaLinks = await fileUploadService.s3Upload(images, 'shieldPlaces');
    }

    if (thumbnail) {
        const [newThumbnail] = await fileUploadService.s3Upload(thumbnail, 'shieldThumbnails');
        updateData.thumbnail = newThumbnail;
    }
    return Place.findByIdAndUpdate(placeId, updateData, {
        new: true,
    });
}

async function deletePlaceAndDevices(placeId) {
    return Place.findByIdAndDelete(placeId).then(doc => {
        if (!doc) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
        }
        eventEmitter.emit(events.placeDeleted, doc);
    });
}

async function getPlaces(filters, options) {
    return Place.paginate(filters, options);
}

async function addDeviceToPlaceById(id, deviceId) {
    return Place.findByIdAndUpdate(
        id,
        { $addToSet: { devices: deviceId } },
        {
            new: true,
        }
    );
}

async function removeDeviceFromPlaceById(id, deviceId) {
    return Place.findByIdAndUpdate(
        id,
        { $pull: { devices: deviceId } },
        {
            new: true,
        }
    );
}

module.exports = {
    createPlace,
    updatePlaceById,
    deletePlaceAndDevices,
    getPlaces,
    getPlaceById,
    addDeviceToPlaceById,
    removeDeviceFromPlaceById,
};
