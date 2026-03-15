const BookingService = require("../services/BookingService");

exports.createBooking = async (req, res, next) => {
  try {
    const guestId = req.user.id; // Assuming guestId comes from authenticated user
    const { roomId, startDate, endDate } = req.body;
    const bookingId = await BookingService.createBooking(guestId, roomId, startDate, endDate);
    res.status(201).json({ message: "Booking created successfully", bookingId });
  } catch (error) {
    next(error);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await BookingService.getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

exports.getBookingsByGuest = async (req, res, next) => {
  try {
    const guestId = req.user.id; // Assuming guestId comes from authenticated user
    const bookings = await BookingService.getBookingsByGuestId(guestId);
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const affectedRows = await BookingService.updateBookingStatus(id, status);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found or no changes made" });
    }
    res.status(200).json({ message: "Booking status updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const affectedRows = await BookingService.deleteBooking(id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    next(error);
  }
};