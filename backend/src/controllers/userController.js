const AuthService = require("../services/AuthService");
const User = require("../models/User");
const { sendSuccess, asyncHandler } = require("../utils/apiResponse");

exports.getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, { user: AuthService.formatUserResponse(req.user) });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const user = await User.updateProfile(req.user.id, req.body);
  return sendSuccess(res, { user: AuthService.formatUserResponse(user) });
});
