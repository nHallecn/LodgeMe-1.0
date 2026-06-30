const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getMyInquiries,
  getLandlordInquiries,
  updateInquiry,
} = require("../controllers/inquiryController");

const router = express.Router();

router.get("/mine", protect, authorize("tenant", "admin"), getMyInquiries);
router.get("/landlord", protect, authorize("landlord", "agent", "admin"), getLandlordInquiries);
router.patch("/:id", protect, authorize("landlord", "agent", "admin"), updateInquiry);

module.exports = router;
