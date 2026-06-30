const Inquiry = require("../models/Inquiry");
const { sendSuccess, sendError, asyncHandler } = require("../utils/apiResponse");

exports.getMyInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.findByTenant(req.user.id);
  return sendSuccess(res, { inquiries }, { count: inquiries.length });
});

exports.getLandlordInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.findByOwner(req.user.id);
  return sendSuccess(res, { inquiries }, { count: inquiries.length });
});

exports.updateInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.update(req.params.id, req.user.id, req.body);
  if (!inquiry) return sendError(res, 404, "INQUIRY_NOT_FOUND", "Inquiry not found", "id");
  return sendSuccess(res, { inquiry });
});
