const listingController = require("./listingController");
const { sendSuccess, asyncHandler } = require("../utils/apiResponse");

exports.createProperty = listingController.createListing;
exports.getProperties = listingController.getListings;
exports.getPropertyById = listingController.getListingById;
exports.updateProperty = listingController.updateListing;
exports.deleteProperty = listingController.deleteListing;
exports.getPropertiesByLandlord = listingController.getMyListings;
exports.getRoomsByProperty = listingController.getListingRooms;
exports.getRoomById = listingController.getListingRooms;

const phaseTwo = asyncHandler(async (_req, res) => {
  return sendSuccess(res, {
    message: "Separate rooms were removed in RentCam Phase 1. Each property is now a listing.",
  }, undefined, 410);
});

exports.addRoom = phaseTwo;
exports.updateRoom = phaseTwo;
exports.deleteRoom = phaseTwo;
exports.updateRoomAvailability = phaseTwo;
