const AuthService = require("../services/AuthService");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

const { user, token } = await AuthService.registerUser(
  name,
  email,
  password,
  role
);
    res.status(201).json({ message: "User registered successfully", user, token });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await AuthService.loginUser(email, password);
    res.status(200).json({ message: "Logged in successfully", user, token });
  } catch (error) {
    next(error);
  }
};