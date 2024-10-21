const httpStatus = require('http-status');
const { placeService } = require('../services');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { getPaginateConfig } = require('../utils/queryPHandler');

const populate = ['devices::name'];

const createPlace = catchAsync(async (req, res) => {
    const { latitude, longitude, ...reqBody } = req.body;
    reqBody.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
    };
    const { thumbnail, images } = req.files;
    const data = await placeService.createPlace(
        {
            ...reqBody,
            createdBy: req.user._id,
        },
        thumbnail,
        images
    );

    res.status(201).send({ data });
});

const updatePlace = catchAsync(async (req, res) => {
    const id = req.params.placeId;
    const { longitude, latitude, ...reqBody } = req.body;
    const { images = [], thumbnail = null } = req.files;
    if (longitude && latitude) {
        reqBody.location = {
            type: 'Point',
            coordinates: [longitude, latitude],
        };
    }
    const updatedPlace = await placeService.updatePlaceById(id, reqBody, thumbnail, images);
    res.json({ data: updatedPlace });
});

const deletePlace = catchAsync(async (req, res) => {
    const { placeId } = req.params;
    const data = await placeService.deletePlaceAndDevices(placeId);
    res.status(204).send();
});

const getPlaces = catchAsync(async (req, res) => {
    const { filters, options } = getPaginateConfig(req.query);
    if (req.user.role === 'user') {
        filters.createdBy = req.user._id;
    }
    options.populate = populate;
    const data = await placeService.getPlaces(filters, options);
    res.json({ data });
});

const getPlace = catchAsync(async (req, res) => {
    const { place } = res.locals;
    res.json({ data: place });
});

module.exports = { createPlace, updatePlace, deletePlace, getPlaces, getPlace };
