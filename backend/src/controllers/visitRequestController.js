const VisitRequestService = require("../services/VisitRequestService");

exports.createVisitRequest = async (req, res, next) => {
  try {
    const guestId = req.user.id;
    const { propertyId, requestedDate, requestedTime, notes } = req.body;
    const visitId = await VisitRequestService.createVisitRequest(propertyId, guestId, requestedDate, requestedTime, notes);
    res.status(201).json({ message: "Visit request sent successfully", visitId });
  } catch (error) {
    next(error);
  }
};

exports.getVisitRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const visit = await VisitRequestService.getVisitRequestById(id);
    if (!visit) return res.status(404).json({ message: "Visit request not found" });
    res.status(200).json(visit);
  } catch (error) {
    next(error);
  }
};

exports.getGuestVisits = async (req, res, next) => {
  try {
    const visits = await VisitRequestService.getVisitRequestsByGuest(req.user.id);
    res.status(200).json(visits);
  } catch (error) {
    next(error);
  }
};

exports.updateVisitStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const affected = await VisitRequestService.updateVisitStatus(id, status);
    if (affected === 0) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Visit status updated" });
  } catch (error) {
    next(error);
  }
};
