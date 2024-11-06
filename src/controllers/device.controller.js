const { deviceService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { createIoTDevice, deleteIoTDevice } = require("../iot/add-device-on-aws");
const fs = require('fs');
const path = require('path');

function generateUniquePassword() {
    return Math.random().toString(36).substring(2, 15);
}

const createDevice = catchAsync(async (req, res) => {
    // const thing = await createIoTDevice(req.body.macAddress);
    const data = await deviceService.createDevice(req.body.placeId, {
        ...req.body,
        place: req.body.placeId,
        createdBy: req.user._id,
        thingId: req.body.macAddress,
        username: req.body.macAddress.replace(/:/g, ''),
        password: generateUniquePassword()
    });
    // Send the response
    res.status(200).json({ status: true, message: "Device added successfully", data });
});

const iotDevices = catchAsync(async (req, res) => {
    const { device_id, epoch_time, exp_time, auth, command_id } = req.body.header;

    console.log("Device ID:", device_id);
    console.log("Auth Token:", auth?.token);
    console.log("Command ID:", command_id);
    // Construct the response
    const response = {
        header: {
            device_id,
            epoch_time: String(Number(epoch_time) + 10),
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
    const data = await deviceService.updateDeviceById(req.params.deviceId, req.body);
    res.json({ data });
});

const updateIOTDevice = catchAsync(async (req, res) => {
    console.log("body data:", req.body);
    const { deviceId } = req.params;
    const { device_id, auth, command_id } = req.body.header;
    const data = req.body.request?.data || {};

    const response = {
        header: {
            device_id,
            auth,
            command_id,
            epoch_time: String(Math.floor(Date.now() / 1000)),
            exp_time: String(Math.floor(Date.now() / 1000) + 10)
        },
        request: { ...data },
        response: {
            response_code: 0,
            response_message: "Success",
            data: {}
        }
    };
    if (command_id === "GET_AUDIO_CONFIG") {
        response.response.data.audio = {
            slot_count: 1,
            slot1_name: "siren_short_32k_16b_pcm.raw"
        };
    }

    // Send the response
    res.status(200).json(response);
});

const deleteDevice = catchAsync(async (req, res) => {
    const { deviceId } = req.params;
    let device = await deviceService.getDeviceById(deviceId);
    if (!device) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
    }
    // let deleteAwsIot = await deleteIoTDevice(device.macAddress);
    // if (!deleteAwsIot.success) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, 'Device deletion failed. Try again later...');
    // }
    await deviceService.deleteDeviceById(deviceId, device.place);
    res.status(204).send();
});

const getAudioFile = catchAsync(async (req, res) => {
    const { filename } = req.params;
    console.log(`Asked to return raw audio data from file ${filename}`);
    const filePath = path.join(__dirname, 'audio', filename);

    try {
        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'audio/wav'); // or the appropriate MIME type for your audio file
            return res.sendFile(filePath);
        } else {
            return res.status(404).send("File not found");
        }
    } catch (error) {
        console.error(`Error reading file: ${error.message}`);
        return res.status(500).send(`Error reading file: ${error.message}`);
    }
})

module.exports = {
    createDevice,
    updateDevice,
    deleteDevice,
    iotDevices,
    updateIOTDevice,
    getAudioFile
};
