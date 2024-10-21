const { deviceService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { createIoTDevice, deleteIoTDevice } = require("../iot/add-device-on-aws");

const createDevice = catchAsync(async (req, res) => {
    const thing = await createIoTDevice(req.body.macAddress)
    const data = await deviceService.createDevice(req.body.placeId, {
        ...req.body,
        place: req.body.placeId,
        createdBy: req.user._id,
        thingId: thing.thingId,
        username: thing.username,
        password: thing.password
    });
    res.status(201).json({
        status: true,
        message: "IOT device successfully added",
        data
    });
});

const updateDevice = catchAsync(async (req, res) => {
    const data = await deviceService.updateDeviceById(req.params.deviceId, req.body);
    res.json({ data });
});

const deleteDevice = catchAsync(async (req, res) => {
    const { deviceId } = req.params;
    let device = await deviceService.getDeviceById(deviceId);
    if (!device) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
    }
    let deleteAwsIot = await deleteIoTDevice(device.macAddress);
    if (!deleteAwsIot.success) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Device deletion failed. Try again later...');
    }
    await deviceService.deleteDeviceById(deviceId, device.placeId);
    res.status(204).send();
});

module.exports = { createDevice, updateDevice, deleteDevice };
