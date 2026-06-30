
const MaintenanceTicketService = require("../services/MaintenanceTicketService");

exports.createTicket = async (req, res, next) => {
  try {
    const { roomId, title, description, priority } = req.body;
    const ticketId = await MaintenanceTicketService.createTicket(
      roomId, req.user.id, title, description, priority
    );
    res.status(201).json({ message: "Ticket created", ticketId });
  } catch (e) { next(e); }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const t = await MaintenanceTicketService.getTicketById(req.params.id);
    if (!t) return res.status(404).json({ message: "Not found" });
    res.status(200).json(t);
  } catch (e) { next(e); }
};

exports.getTicketsByRoom = async (req, res, next) => {
  try { res.status(200).json(await MaintenanceTicketService.getTicketsByRoomId(req.params.roomId)); }
  catch (e) { next(e); }
};

exports.getTicketsByUser = async (req, res, next) => {
  try { res.status(200).json(await MaintenanceTicketService.getTicketsByReportedByUserId(req.user.id)); }
  catch (e) { next(e); }
};

exports.getTicketsByLandlord = async (req, res, next) => {
  try { res.status(200).json(await MaintenanceTicketService.getTicketsByLandlordId(req.user.id)); }
  catch (e) { next(e); }
};

exports.updateTicket = async (req, res, next) => {
  try {
    const affected = await MaintenanceTicketService.updateTicket(req.params.id, req.body);
    if (affected === 0) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Ticket updated" });
  } catch (e) { next(e); }
};

exports.deleteTicket = async (req, res, next) => {
  try {
    const affected = await MaintenanceTicketService.deleteTicket(req.params.id);
    if (affected === 0) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Ticket deleted" });
  } catch (e) { next(e); }
};
