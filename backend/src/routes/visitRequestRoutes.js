const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createVisitRequest,
  getVisitRequestById,
  getGuestVisits,
  getLandlordVisits,
  updateVisitStatus,
} = require("../controllers/visitRequestController");

const router = express.Router();

router.post("/", protect, authorize("tenant", "admin"), createVisitRequest);
router.get("/my-visits", protect, authorize("tenant", "admin"), getGuestVisits);
router.get("/landlord", protect, authorize("landlord", "admin"), getLandlordVisits);
router.get("/:id", protect, getVisitRequestById);
router.patch("/:id/status", protect, authorize("landlord", "admin"), updateVisitStatus);

module.exports = router;
