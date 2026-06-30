const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  replaceListingPhotos,
  createInquiry,
  getListingInquiries,
  getListingRooms,
  reportListing,
} = require("../controllers/listingController");

const router = express.Router();

router.get("/", getListings);
router.get("/mine", protect, authorize("landlord", "agent", "admin"), getMyListings);
router.post("/", protect, authorize("landlord", "agent", "admin"), createListing);
router.get("/:id/rooms", getListingRooms);
router.get("/:id/inquiries", protect, authorize("landlord", "agent", "admin"), getListingInquiries);
router.post("/:id/inquiries", protect, authorize("tenant", "admin"), createInquiry);
router.post("/:id/photos", protect, authorize("landlord", "agent", "admin"), replaceListingPhotos);
router.post("/:id/report", protect, reportListing);
router.get("/:id", getListingById);
router.patch("/:id", protect, authorize("landlord", "agent", "admin"), updateListing);
router.put("/:id", protect, authorize("landlord", "agent", "admin"), updateListing);
router.delete("/:id", protect, authorize("landlord", "agent", "admin"), deleteListing);

module.exports = router;
