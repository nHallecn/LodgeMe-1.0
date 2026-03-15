const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createVisitRequest,
  getVisitRequestById,
  getGuestVisits,
  updateVisitStatus
} = require("../controllers/visitRequestController");

const router = express.Router();

router.post("/", protect, authorize("user", "admin"), createVisitRequest);
router.get("/my-visits", protect, getGuestVisits);
router.get("/:id", protect, getVisitRequestById);
router.patch("/:id/status", protect, authorize("landlord", "admin"), updateVisitStatus);

module.exports = router;
