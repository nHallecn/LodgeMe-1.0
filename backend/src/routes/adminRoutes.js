const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { getListingQueue, verifyListing, getStats } = require("../controllers/adminController");

const router = express.Router();

router.use(protect, authorize("admin", "super_admin"));
router.get("/stats", getStats);
router.get("/listings/queue", getListingQueue);
router.patch("/listings/:id/verify", verifyListing);

module.exports = router;
