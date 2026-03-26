const PropertyService = require("../services/PropertyService");

exports.createProperty = async (req, res, next) => {
  try {
    const landlordId = req.user.id;
    const { name, city, neighborhood, latitude, longitude, description, totalRooms, amenities, images } = req.body;
    const propertyId = await PropertyService.createProperty(
      landlordId, name, city, neighborhood, latitude, longitude,
      description, totalRooms, amenities, images || []
    );
    res.status(201).json({ message: "Property created successfully", propertyId });
  } catch (error) { next(error); }
};

exports.getProperties = async (req, res, next) => {
  try {
    const properties = await PropertyService.searchProperties(req.query);
    res.status(200).json(properties);
  } catch (error) { next(error); }
};

exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await PropertyService.getPropertyById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.status(200).json(property);
  } catch (error) { next(error); }
};

exports.updateProperty = async (req, res, next) => {
  try {
    const affectedRows = await PropertyService.updateProperty(req.params.id, req.body);
    if (affectedRows === 0) return res.status(404).json({ message: "Property not found or no changes made" });
    res.status(200).json({ message: "Property updated successfully" });
  } catch (error) { next(error); }
};

exports.deleteProperty = async (req, res, next) => {
  try {
    const affectedRows = await PropertyService.deleteProperty(req.params.id);
    if (affectedRows === 0) return res.status(404).json({ message: "Property not found" });
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) { next(error); }
};

exports.getPropertiesByLandlord = async (req, res, next) => {
  try {
    const properties = await PropertyService.getPropertiesByLandlord(req.params.landlordId);
    res.status(200).json(properties);
  } catch (error) { next(error); }
};

exports.addRoom = async (req, res, next) => {
  try {
    const roomId = await PropertyService.addRoomToProperty(req.params.propertyId, req.body);
    res.status(201).json({ message: "Room added successfully", roomId });
  } catch (error) { next(error); }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const affectedRows = await PropertyService.updateRoom(req.params.roomId, req.body);
    if (affectedRows === 0) return res.status(404).json({ message: "Room not found or no changes made" });
    res.status(200).json({ message: "Room updated successfully" });
  } catch (error) { next(error); }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const affectedRows = await PropertyService.deleteRoom(req.params.roomId);
    if (affectedRows === 0) return res.status(404).json({ message: "Room not found" });
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) { next(error); }
};

exports.getRoomById = async (req, res, next) => {
  try {
    const room = await PropertyService.getRoomById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.status(200).json(room);
  } catch (error) { next(error); }
};

exports.getRoomsByProperty = async (req, res, next) => {
  try {
    const rooms = await PropertyService.getRoomsByPropertyId(req.params.propertyId);
    res.status(200).json(rooms);
  } catch (error) { next(error); }
};

exports.updateRoomAvailability = async (req, res, next) => {
  try {
    const affectedRows = await PropertyService.updateRoomAvailability(req.params.roomId, req.body.isAvailable);
    if (affectedRows === 0) return res.status(404).json({ message: "Room not found or no changes made" });
    res.status(200).json({ message: "Room availability updated successfully" });
  } catch (error) { next(error); }
};
