const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const getAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate overall statistics
    const totalInterviews = user.interviewHistory.length;
    const averageScore =
      totalInterviews > 0
        ? Math.round(
            user.interviewHistory.reduce(
              (acc, interview) => acc + interview.score,
              0
            ) / totalInterviews
          )
        : 0;

    // Get recent interviews (last 10)
    const recentInterviews = user.interviewHistory
      .sort((a, b) => b.date - a.date)
      .slice(0, 10)
      .map((interview) => ({
        date: interview.date,
        score: interview.score,
        techStack: interview.techStack,
        difficulty: interview.difficulty,
      }));

    // Calculate performance by tech stack
    const techStackPerformance = {};
    user.interviewHistory.forEach((interview) => {
      if (!techStackPerformance[interview.techStack]) {
        techStackPerformance[interview.techStack] = {
          total: 0,
          count: 0,
        };
      }
      techStackPerformance[interview.techStack].total += interview.score;
      techStackPerformance[interview.techStack].count += 1;
    });

    Object.keys(techStackPerformance).forEach((stack) => {
      techStackPerformance[stack] = Math.round(
        techStackPerformance[stack].total / techStackPerformance[stack].count
      );
    });

    // Calculate performance by difficulty
    const difficultyPerformance = {};
    user.interviewHistory.forEach((interview) => {
      if (!difficultyPerformance[interview.difficulty]) {
        difficultyPerformance[interview.difficulty] = {
          total: 0,
          count: 0,
        };
      }
      difficultyPerformance[interview.difficulty].total += interview.score;
      difficultyPerformance[interview.difficulty].count += 1;
    });

    Object.keys(difficultyPerformance).forEach((difficulty) => {
      difficultyPerformance[difficulty] = Math.round(
        difficultyPerformance[difficulty].total /
          difficultyPerformance[difficulty].count
      );
    });

    // Calculate strengths and weaknesses based on feedback analysis
    const strengthsWeaknesses = {
      problemSolving: 0,
      codeQuality: 0,
      timeManagement: 0,
      communication: 0,
      technicalKnowledge: 0,
    };

    user.interviewHistory.forEach((interview) => {
      interview.questions.forEach((q) => {
        const feedback = q.feedback.toLowerCase();

        // Problem Solving
        if (
          feedback.includes("problem solving") ||
          feedback.includes("algorithm")
        ) {
          strengthsWeaknesses.problemSolving += q.score;
        }

        // Code Quality
        if (
          feedback.includes("code quality") ||
          feedback.includes("clean code") ||
          feedback.includes("best practices")
        ) {
          strengthsWeaknesses.codeQuality += q.score;
        }

        // Time Management
        if (
          feedback.includes("time management") ||
          feedback.includes("efficiency")
        ) {
          strengthsWeaknesses.timeManagement += q.score;
        }

        // Communication
        if (
          feedback.includes("communication") ||
          feedback.includes("explanation")
        ) {
          strengthsWeaknesses.communication += q.score;
        }

        // Technical Knowledge
        if (
          feedback.includes("technical") ||
          feedback.includes("knowledge") ||
          feedback.includes("understanding")
        ) {
          strengthsWeaknesses.technicalKnowledge += q.score;
        }
      });
    });

    // Normalize strengths and weaknesses scores to 0-100 range
    const totalQuestions = user.interviewHistory.reduce(
      (acc, interview) => acc + interview.questions.length,
      0
    );
    Object.keys(strengthsWeaknesses).forEach((key) => {
      strengthsWeaknesses[key] = Math.round(
        (strengthsWeaknesses[key] / totalQuestions) * 100
      );
    });

    res.json({
      totalInterviews,
      averageScore,
      recentInterviews,
      techStackPerformance,
      difficultyPerformance,
      strengthsWeaknesses,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone: phone || "",
      password: hashedPassword,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: user.token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: user.token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }
    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: user.token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Set token count (admin/payment simulation)
const setTokenCount = async (req, res) => {
  try {
    const { token } = req.body;
    if (typeof token !== "number" || token < 0) {
      return res.status(400).json({ error: "Invalid token value" });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.token = token;
    await user.save();
    res.json({ token: user.token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  getAnalytics,
  setTokenCount,
};
