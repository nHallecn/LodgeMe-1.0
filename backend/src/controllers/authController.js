const AuthService = require("../services/AuthService");
const User = require("../models/User");
const { sendSuccess, asyncHandler } = require("../utils/apiResponse");

exports.requestOtp = asyncHandler(async (req, res) => {
  const result = await AuthService.requestOtp(req.body.phone);
  return sendSuccess(res, result);
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const result = await AuthService.verifyOtp(req.body);
  return sendSuccess(res, result);
});

exports.me = asyncHandler(async (req, res) => {
  return sendSuccess(res, { user: AuthService.formatUserResponse(req.user) });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const user = await User.updateProfile(req.user.id, req.body);
  return sendSuccess(res, { user: AuthService.formatUserResponse(user) });
});

exports.logout = asyncHandler(async (_req, res) => {
  return sendSuccess(res, { message: "Logged out" });
});

exports.register = asyncHandler(async (req, res) => {
  const { user, token } = await AuthService.registerUser(req.body);
  return sendSuccess(res, { user, token }, undefined, 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { user, token } = await AuthService.loginUser(req.body);
  return sendSuccess(res, { user, token });
});
