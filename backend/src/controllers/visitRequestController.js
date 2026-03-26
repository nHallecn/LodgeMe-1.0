const VisitRequestService = require("../services/VisitRequestService");

exports.createVisitRequest = async (req, res, next) => {
  try {
    const { propertyId, requestedDate, requestedTime, notes } = req.body;
    const visitId = await VisitRequestService.createVisitRequest(propertyId, req.user.id, requestedDate, requestedTime, notes);
    res.status(201).json({ message: "Visit request sent successfully", visitId });
  } catch (error) { next(error); }
};

exports.getVisitRequestById = async (req, res, next) => {
  try {
    const visit = await VisitRequestService.getVisitRequestById(req.params.id);
    if (!visit) return res.status(404).json({ message: "Visit request not found" });
    res.status(200).json(visit);
  } catch (error) { next(error); }
};

exports.getGuestVisits = async (req, res, next) => {
  try {
    const visits = await VisitRequestService.getVisitRequestsByGuest(req.user.id);
    res.status(200).json(visits);
  } catch (error) { next(error); }
};

// NEW: landlord sees visit requests for their properties
exports.getLandlordVisits = async (req, res, next) => {
  try {
    const visits = await VisitRequestService.getVisitRequestsByLandlord(req.user.id);
    res.status(200).json(visits);
  } catch (error) { next(error); }
};

exports.updateVisitStatus = async (req, res, next) => {
  try {
    const affected = await VisitRequestService.updateVisitStatus(req.params.id, req.body.status);
    if (affected === 0) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Visit status updated" });
  } catch (error) { next(error); }
};
