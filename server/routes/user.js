const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Login route: find user by email or name
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email, password);
    const user = await User.findOne({ email });
    console.log("User found:", user);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log("Password match:", isMatch);
    res.send(isMatch);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    // Do not send password back to client
    const { password: pw, ...userData } = user.toObject();
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register route: create a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
      techStack: "",
      interviewHistory: [],
    });
    await user.save();
    res.json({ name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
