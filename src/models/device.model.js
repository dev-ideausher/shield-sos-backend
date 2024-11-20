const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
      unique: true,
    },
    macAddress: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    thingId: {
      type: String,
      required: true,
    },
    strobe: {
      type: String,
      default: "on",
      enum: ["on", "off"],
    },
    siren: {
      type: String,
      default: "on",
      enum: ["on", "off"],
    },
    recNumber: {
      type: Number,
      default: 1,
    },
    recVolume: {
      type: Number,
      default: 100,
      min: 0, // Minimum
      max: 100, // Maximun
    },
    recRepeat: { type: Number, default: 0 },
    deploy: { type: String, default: "on", enum: ["on", "off"] },
    deployDelay: { type: Number, default: 3, required: true }, // time in seconds
    duration: { type: Number, default: 600, required: true }, // time in seconds
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports.Device = mongoose.model("Device", deviceSchema, "Device");
