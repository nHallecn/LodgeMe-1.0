const PropertyService = require("../services/PropertyService");

exports.createProperty = async (req, res, next) => {
  try {
    const landlordId = req.user.id; // Assuming landlordId comes from authenticated user
    const { name, city, neighborhood, latitude, longitude, description, totalRooms, amenities } = req.body;
    const propertyId = await PropertyService.createProperty(landlordId, name, city, neighborhood, latitude, longitude, description, totalRooms, amenities);
    res.status(201).json({ message: "Property created successfully", propertyId });
  } catch (error) {
    next(error);
  }
};

exports.getProperties = async (req, res, next) => {
  try {
    const filters = req.query; // city, neighborhood, minPrice, maxPrice, roomType, isAvailable, limit, offset
    const properties = await PropertyService.searchProperties(filters);
    res.status(200).json(properties);
  } catch (error) {
    next(error);
  }
};

exports.getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await PropertyService.getPropertyById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    next(error);
  }
};

exports.updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const propertyData = req.body;
    const affectedRows = await PropertyService.updateProperty(id, propertyData);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Property not found or no changes made" });
    }
    res.status(200).json({ message: "Property updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const affectedRows = await PropertyService.deleteProperty(id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getPropertiesByLandlord = async (req, res, next) => {
  try {
    const { landlordId } = req.params;
    const properties = await PropertyService.getPropertiesByLandlord(landlordId);
    res.status(200).json(properties);
  } catch (error) {
    next(error);
  }
};

exports.addRoom = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const roomData = req.body;
    const roomId = await PropertyService.addRoomToProperty(propertyId, roomData);
    res.status(201).json({ message: "Room added successfully", roomId });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const roomData = req.body;
    const affectedRows = await PropertyService.updateRoom(roomId, roomData);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Room not found or no changes made" });
    }
    res.status(200).json({ message: "Room updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const affectedRows = await PropertyService.deleteRoom(roomId);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getRoomById = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await PropertyService.getRoomById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};

exports.getRoomsByProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const rooms = await PropertyService.getRoomsByPropertyId(propertyId);
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
};

exports.updateRoomAvailability = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { isAvailable } = req.body;
    const affectedRows = await PropertyService.updateRoomAvailability(roomId, isAvailable);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Room not found or no changes made" });
    }
    res.status(200).json({ message: "Room availability updated successfully" });
  } catch (error) {
    next(error);
  }
};