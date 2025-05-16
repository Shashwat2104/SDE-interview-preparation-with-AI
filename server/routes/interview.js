const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");

// Generate a new interview question
router.post("/generate-question", interviewController.generateQuestion);

// Evaluate an answer
router.post("/evaluate-answer", interviewController.evaluateAnswer);

// Save interview session
router.post("/save-interview", interviewController.saveInterview);

module.exports = router;
