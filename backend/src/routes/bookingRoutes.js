const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createBooking,
  getBookingById,
  getBookingsByGuest,
  getBookingsByLandlord,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/", protect, authorize("tenant", "admin"), createBooking);
router.get("/guest", protect, authorize("tenant", "admin"), getBookingsByGuest);
router.get("/landlord", protect, authorize("landlord", "admin"), getBookingsByLandlord);
router.get("/:id", protect, authorize("tenant", "landlord", "admin"), getBookingById);
router.patch("/:id/status", protect, authorize("landlord", "admin"), updateBookingStatus);
router.delete("/:id", protect, authorize("tenant", "admin"), deleteBooking);

module.exports = router;
