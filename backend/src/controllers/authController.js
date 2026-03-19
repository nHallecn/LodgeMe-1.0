const AuthService = require("../services/AuthService");

exports.register = async (req, res, next) => {
  try {
    const { openId, name, email, loginMethod, role } = req.body;
    const { user, token } = await AuthService.registerUser(openId, name, email, loginMethod, role);
    res.status(201).json({ message: "User registered successfully", user, token });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { openId } = req.body;
    const { user, token } = await AuthService.loginUser(openId);
    res.status(200).json({ message: "Logged in successfully", user, token });
  } catch (error) {
    next(error);
  }
};