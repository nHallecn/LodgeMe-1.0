const MaintenanceTicketService = require("../services/MaintenanceTicketService");

exports.createMaintenanceTicket = async (req, res, next) => {
  try {
    const reportedByUserId = req.user.id; // Assuming reportedByUserId comes from authenticated user
    const { roomId, title, description, priority } = req.body;
    const ticketId = await MaintenanceTicketService.createTicket(roomId, reportedByUserId, title, description, priority);
    res.status(201).json({ message: "Maintenance ticket created successfully", ticketId });
  } catch (error) {
    next(error);
  }
};

exports.getMaintenanceTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await MaintenanceTicketService.getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Maintenance ticket not found" });
    }
    res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
};

exports.getMaintenanceTicketsByRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const tickets = await MaintenanceTicketService.getTicketsByRoomId(roomId);
    res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
};

exports.getMaintenanceTicketsByUser = async (req, res, next) => {
  try {
    const reportedByUserId = req.user.id; // Assuming reportedByUserId comes from authenticated user
    const tickets = await MaintenanceTicketService.getTicketsByReportedByUserId(reportedByUserId);
    res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
};

exports.updateMaintenanceTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticketData = req.body;
    const affectedRows = await MaintenanceTicketService.updateTicket(id, ticketData);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Maintenance ticket not found or no changes made" });
    }
    res.status(200).json({ message: "Maintenance ticket updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteMaintenanceTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const affectedRows = await MaintenanceTicketService.deleteTicket(id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Maintenance ticket not found" });
    }
    res.status(200).json({ message: "Maintenance ticket deleted successfully" });
  } catch (error) {
    next(error);
  }
};