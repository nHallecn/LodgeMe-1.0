const Listing = require("../models/Listing");
const Inquiry = require("../models/Inquiry");
const { sendSuccess, sendError, asyncHandler } = require("../utils/apiResponse");

function canManage(user, listing) {
  if (!user || !listing) return false;
  if (["admin", "super_admin"].includes(user.role)) return true;
  return String(listing.landlordId) === String(user.id) || String(listing.agentId || "") === String(user.id);
}

exports.getListings = asyncHandler(async (req, res) => {
  const listings = await Listing.findAll(req.query);
  return sendSuccess(res, { listings }, { count: listings.length });
});

exports.getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.findAll({
    ...req.query,
    ownerId: req.user.id,
    includeUnavailable: true,
  });
  return sendSuccess(res, { listings }, { count: listings.length });
});

exports.getListingById = asyncHandler(async (req, res) => {
  const includeUnavailable = Boolean(req.user && ["admin", "super_admin", "landlord", "agent"].includes(req.user.role));
  const listing = await Listing.findById(req.params.id, { includeUnavailable, incrementView: true });
  if (!listing) return sendError(res, 404, "LISTING_NOT_FOUND", "Listing not found", "id");
  return sendSuccess(res, { listing });
});

exports.createListing = asyncHandler(async (req, res) => {
  const listing = await Listing.create(req.user, req.body);
  return sendSuccess(res, { listing }, undefined, 201);
});

exports.updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id, { includeUnavailable: true });
  if (!listing) return sendError(res, 404, "LISTING_NOT_FOUND", "Listing not found", "id");
  if (!canManage(req.user, listing)) return sendError(res, 403, "LISTING_FORBIDDEN", "You cannot update this listing");

  const updated = await Listing.update(req.params.id, req.body);
  return sendSuccess(res, { listing: updated });
});

exports.deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id, { includeUnavailable: true });
  if (!listing) return sendError(res, 404, "LISTING_NOT_FOUND", "Listing not found", "id");
  if (!canManage(req.user, listing)) return sendError(res, 403, "LISTING_FORBIDDEN", "You cannot delete this listing");

  await Listing.softDelete(req.params.id);
  return sendSuccess(res, { message: "Listing deleted" });
});

exports.replaceListingPhotos = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id, { includeUnavailable: true });
  if (!listing) return sendError(res, 404, "LISTING_NOT_FOUND", "Listing not found", "id");
  if (!canManage(req.user, listing)) return sendError(res, 403, "LISTING_FORBIDDEN", "You cannot update photos for this listing");

  const updated = await Listing.replacePhotos(req.params.id, req.body.photos || req.body.images || []);
  return sendSuccess(res, { listing: updated });
});

exports.createInquiry = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return sendError(res, 404, "LISTING_NOT_FOUND", "Listing not found", "id");

  const inquiry = await Inquiry.create(req.params.id, req.user.id, req.body);
  return sendSuccess(res, { inquiry }, undefined, 201);
});

exports.getListingInquiries = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id, { includeUnavailable: true });
  if (!listing) return sendError(res, 404, "LISTING_NOT_FOUND", "Listing not found", "id");
  if (!canManage(req.user, listing)) return sendError(res, 403, "LISTING_FORBIDDEN", "You cannot view inquiries for this listing");

  const inquiries = await Inquiry.findByProperty(req.params.id, req.user.id);
  return sendSuccess(res, { inquiries }, { count: inquiries.length });
});

exports.getListingRooms = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id || req.params.propertyId, { includeUnavailable: true });
  if (!listing) return sendError(res, 404, "LISTING_NOT_FOUND", "Listing not found", "id");
  return sendSuccess(res, { rooms: listing.rooms });
});

exports.reportListing = asyncHandler(async (_req, res) => {
  return sendSuccess(res, { message: "Report received for admin review" }, undefined, 201);
});
