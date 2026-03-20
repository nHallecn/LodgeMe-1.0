const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed or expired" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user ? req.user.role : "unknown"} is not authorized to access this route`,
      });
    }
    next();
  };
};