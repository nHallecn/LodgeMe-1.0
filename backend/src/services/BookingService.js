const Booking = require("../models/Booking");
const Room = require("../models/Room");

class BookingService {
  static async createBooking(guestId, roomId, startDate, endDate) {
    // Optionally, add logic to check room availability before creating a booking
    const bookingId = await Booking.create(guestId, roomId, startDate, endDate);
    // Optionally, update room availability status
    // await Room.updateAvailability(roomId, false);
    return bookingId;
  }

  static async getBookingById(id) {
    return await Booking.findById(id);
  }

  static async getBookingsByGuestId(guestId) {
    return await Booking.findByGuestId(guestId);
  }

  static async getBookingsByRoomId(roomId) {
    return await Booking.findByRoomId(roomId);
  }

  static async updateBookingStatus(id, status) {
    // Optionally, add logic to update room availability based on booking status
    return await Booking.updateStatus(id, status);
  }

  static async deleteBooking(id) {
    // Optionally, update room availability status if booking is deleted
    return await Booking.delete(id);
  }
}

module.exports = BookingService;