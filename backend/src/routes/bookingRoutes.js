const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createBooking,
  getBookingById,
  getBookingsByGuest,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/", protect, authorize("user", "admin"), createBooking);
router.get("/guest", protect, authorize("user", "admin"), getBookingsByGuest);
router.get("/:id", protect, authorize("user", "landlord", "admin"), getBookingById);
router.patch("/:id/status", protect, authorize("landlord", "admin"), updateBookingStatus);
router.delete("/:id", protect, authorize("user", "admin"), deleteBooking);

module.exports = router;