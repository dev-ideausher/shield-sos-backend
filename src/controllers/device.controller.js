const { deviceService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { createIoTDevice, deleteIoTDevice } = require("../iot/add-device-on-aws");

const createDevice = catchAsync(async (req, res) => {
    const { device_id, epoch_time, exp_time, auth, command_id } = req.body.header;

    console.log("Device ID:", device_id);
    console.log("Auth Token:", auth?.token);
    console.log("Command ID:", command_id);

    // Process the registration, such as creating an IoT device
    // Uncomment and complete if using these lines:
    // const thing = await createIoTDevice(req.body.macAddress);
    // const data = await deviceService.createDevice(req.body.placeId, {
    //     ...req.body,
    //     place: req.body.placeId,
    //     createdBy: req.user._id,
    //     thingId: thing.thingId,
    //     username: thing.username,
    //     password: thing.password
    // });

    // Construct the response
    const response = {
        header: {
            device_id,
            epoch_time: String(Number(epoch_time) + 10),  // Adjusting as an example
            exp_time: String(Number(exp_time) + 10),
            auth,
            command_id
        },
        request: {},
        response: {
            response_code: 0,
            response_message: "Success",
            data: {}  // Empty data object as per example
        }
    };

    // Send the response
    res.status(200).json(response);
});

const updateDevice = catchAsync(async (req, res) => {
    const { deviceId } = req.params;
    const { device_id, auth, command_id } = req.body.header;
    const data = req.body.request?.data || {};

    console.log(device_id, auth, command_id)

    // if (device_id !== deviceId) {
    //     return res.status(400).json({
    //         response: {
    //             response_code: 1,
    //             response_message: "Device ID mismatch"
    //         }
    //     });
    // }

    // const updatedData = await deviceService.updateDeviceById(deviceId, data);
    const response = {
        header: {
            device_id,
            auth,
            command_id,
            epoch_time: String(Math.floor(Date.now() / 1000)),
            exp_time: String(Math.floor(Date.now() / 1000) + 10)  // Adjust as per your requirement
        },
        request: { data },
        response: {
            response_code: 0,
            response_message: "Success",
            data: {}
        }
    };

    // Send the response
    res.status(200).json(response);
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
