const db = require("../config/db");
const Listing = require("../models/Listing");
const { sendSuccess, sendError, asyncHandler } = require("../utils/apiResponse");

exports.getListingQueue = asyncHandler(async (req, res) => {
  const listings = await Listing.findAll({
    ...req.query,
    status: req.query.status || "pending_review",
    includeUnavailable: true,
  });
  return sendSuccess(res, { listings }, { count: listings.length });
});

exports.verifyListing = asyncHandler(async (req, res) => {
  const allowed = ["available", "rejected", "hidden", "pending_review"];
  const status = req.body.status;
  if (!allowed.includes(status)) {
    return sendError(res, 400, "INVALID_LISTING_STATUS", `Status must be one of: ${allowed.join(", ")}`, "status");
  }

  const listing = await Listing.verify(req.params.id, req.user.id, status, req.body.rejectionReason || null);
  if (!listing) return sendError(res, 404, "LISTING_NOT_FOUND", "Listing not found", "id");
  return sendSuccess(res, { listing });
});

exports.getStats = asyncHandler(async (_req, res) => {
  const { rows } = await db.query(`
    SELECT
      (SELECT COUNT(*)::int FROM users WHERE deleted_at IS NULL) AS users,
      (SELECT COUNT(*)::int FROM properties WHERE deleted_at IS NULL) AS listings,
      (SELECT COUNT(*)::int FROM properties WHERE status = 'pending_review' AND deleted_at IS NULL) AS pending_listings,
      (SELECT COUNT(*)::int FROM inquiries) AS inquiries
  `);
  return sendSuccess(res, { stats: rows[0] });
});
