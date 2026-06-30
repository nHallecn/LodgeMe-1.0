const express = require("express");
const {
  requestOtp,
  verifyOtp,
  me,
  updateMe,
  logout,
  register,
  login,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/refresh", (_req, res) => res.status(501).json({
  success: false,
  error: { code: "REFRESH_NOT_IMPLEMENTED", message: "Refresh-token storage is planned for Redis." },
}));
router.delete("/logout", protect, logout);
router.get("/me", protect, me);
router.patch("/me", protect, updateMe);

// Legacy LodgeMe endpoints now return a clear migration error.
router.post("/register", register);
router.post("/login", login);

module.exports = router;
