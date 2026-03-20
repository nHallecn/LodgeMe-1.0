const AuthService = require("../services/AuthService");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Missing required fields: name, email, password, role",
      });
    }

    const { user, token } = await AuthService.registerUser(name, email, password, role);
    res.status(201).json({ message: "User registered successfully", user, token });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Missing required fields: email, password",
      });
    }

    const { user, token } = await AuthService.loginUser(email, password);
    res.status(200).json({ message: "Logged in successfully", user, token });
  } catch (error) {
    next(error);
  }
};