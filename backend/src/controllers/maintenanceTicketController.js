const MaintenanceTicketService = require("../services/MaintenanceTicketService");

exports.createMaintenanceTicket = async (req, res, next) => {
  try {
    const { roomId, title, description, priority } = req.body;
    const ticketId = await MaintenanceTicketService.createTicket(roomId, req.user.id, title, description, priority);
    res.status(201).json({ message: "Maintenance ticket created successfully", ticketId });
  } catch (error) { next(error); }
};

exports.getMaintenanceTicketById = async (req, res, next) => {
  try {
    const ticket = await MaintenanceTicketService.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Maintenance ticket not found" });
    res.status(200).json(ticket);
  } catch (error) { next(error); }
};

exports.getMaintenanceTicketsByRoom = async (req, res, next) => {
  try {
    const tickets = await MaintenanceTicketService.getTicketsByRoomId(req.params.roomId);
    res.status(200).json(tickets);
  } catch (error) { next(error); }
};

exports.getMaintenanceTicketsByUser = async (req, res, next) => {
  try {
    const tickets = await MaintenanceTicketService.getTicketsByReportedByUserId(req.user.id);
    res.status(200).json(tickets);
  } catch (error) { next(error); }
};

// NEW: landlord sees all tickets across their properties
exports.getMaintenanceTicketsByLandlord = async (req, res, next) => {
  try {
    const tickets = await MaintenanceTicketService.getTicketsByLandlordId(req.user.id);
    res.status(200).json(tickets);
  } catch (error) { next(error); }
};

exports.updateMaintenanceTicket = async (req, res, next) => {
  try {
    const affectedRows = await MaintenanceTicketService.updateTicket(req.params.id, req.body);
    if (affectedRows === 0) return res.status(404).json({ message: "Maintenance ticket not found or no changes made" });
    res.status(200).json({ message: "Maintenance ticket updated successfully" });
  } catch (error) { next(error); }
};

exports.deleteMaintenanceTicket = async (req, res, next) => {
  try {
    const affectedRows = await MaintenanceTicketService.deleteTicket(req.params.id);
    if (affectedRows === 0) return res.status(404).json({ message: "Maintenance ticket not found" });
    res.status(200).json({ message: "Maintenance ticket deleted successfully" });
  } catch (error) { next(error); }
};
