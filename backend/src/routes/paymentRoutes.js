const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  recordPayment,
  getPaymentById,
  getPaymentsByLandlord,
  getPaymentsByGuest,
  updatePayment,
  deletePayment,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/", protect, authorize("landlord", "admin"), recordPayment);
router.get("/landlord", protect, authorize("landlord", "admin"), getPaymentsByLandlord);
router.get("/guest", protect, authorize("tenant", "admin"), getPaymentsByGuest);
router.get("/:id", protect, authorize("landlord", "tenant", "admin"), getPaymentById);
router.put("/:id", protect, authorize("landlord", "admin"), updatePayment);
router.delete("/:id", protect, authorize("landlord", "admin"), deletePayment);

module.exports = router;
