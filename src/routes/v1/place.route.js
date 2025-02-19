const express = require("express");
const router = express.Router();
const { placeController } = require("../../controllers");
const { firebaseAuth } = require("../../middlewares/firebaseAuth");
const { fileUploadService } = require("../../microservices");
const shield = require("../../middlewares/place");

router.get("/getPlaces", firebaseAuth(), placeController.getPlaces);

router.get(
  "/:placeId",
  firebaseAuth(),
  shield.checkOwnership,
  placeController.getPlace
);

router.post(
  "/",
  firebaseAuth(),
  fileUploadService.multerUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  placeController.createPlace
);

router.patch(
  "/:placeId",
  firebaseAuth(),
  fileUploadService.multerUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  placeController.updatePlace
);

router.delete("/:placeId", firebaseAuth(), placeController.deletePlace);

module.exports = router;
