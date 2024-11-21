// controllers/userController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../model/userModel/userModel");
require("dotenv").config();

// Register a new user
exports.register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      phone_number,
      role_id,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const userId = await User.createUser({
      username,
      email,
      password_hash,
      first_name,
      last_name,
      phone_number,
      role_id,
    });

    res.status(201).json({ message: "User registered successfully.", userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User Not Found!" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Update last login
    await User.updateLastLogin(user.id);
    const { username, first_name, last_name } = user;
    // Create JWT
    const payload = {
      user: {
        id: user.id,
        username: username,
        email: email,
        first_name: first_name,
        last_name: last_name,
        role_id: user.role_id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1y",
    });

    res.status(200).json({ message: "Login Success", data: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const {
      username,
      email,
      first_name,
      last_name,
      phone_number,
      role_id,
      is_active,
    } = req.body;
    const userId = req.params.id;

    // Optionally, add checks to prevent duplicate emails/usernames
    const existingUser = await User.findUserByEmail(email);
    if (existingUser && existingUser.id !== parseInt(userId)) {
      return res
        .status(400)
        .json({ message: "Email is already in use by another user." });
    }

    const affectedRows = await User.updateUser(userId, {
      username,
      email,
      first_name,
      last_name,
      phone_number,
      role_id,
      is_active,
    });

    if (affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made." });
    }

    res.json({ message: "User updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const affectedRows = await User.deleteUser(userId);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};
