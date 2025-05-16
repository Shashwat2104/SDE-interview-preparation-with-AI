const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  updateProfile,
  getAnalytics,
  setTokenCount,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/profile", protect, updateProfile);
router.get("/analytics", protect, getAnalytics);
router.patch("/token", protect, setTokenCount);

module.exports = router;
