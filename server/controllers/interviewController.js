const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require("../models/userModel");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const interviewController = {
  // Generate interview question
  generateQuestion: async (req, res) => {
    try {
      const {
        techStack,
        previousQuestions = [],
        difficulty = "medium",
      } = req.body;
      const questionModel = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
      // Randomly pick SDE-1 or SDE-2
      const level = Math.random() < 0.5 ? "SDE-1" : "SDE-2";
      // Randomly pick theory or practical
      const type = Math.random() < 0.5 ? "theory" : "practical";
      const prompt = `Generate a single, very important and highly relevant ${type} technical interview question for a ${level} (${techStack}) software engineering candidate. 
- The question must be a must-know, high-value question for SDE interviews, frequently asked or critical for SDE roles.
- The question should be suitable for a real interview, concise, and focused on core concepts or problem-solving skills relevant to ${techStack}.
- The question should be of ${difficulty} difficulty.
- Do NOT include explanations, meta-commentary, or extra context. Do NOT ask multiple questions in one. Only return ONE question, not a group or list.\n\nPrevious questions: ${previousQuestions.join(
        ", "
      )}`;
      const result = await questionModel.generateContent({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      });
      const question = result.response.text();
      res.json({ question });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Evaluate answer
  evaluateAnswer: async (req, res) => {
    try {
      const { question, answer, techStack } = req.body;
      const evaluationModel = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
      const prompt = `Evaluate this answer for the following ${techStack} interview question:\nQuestion: ${question}\nAnswer: ${answer}\nGive a score out of 10 (be critical and do NOT always give 10/10). Provide the correct answer/solution, and if the answer is incomplete or wrong, briefly explain what was missing or incorrect. Give a concise, honest evaluation with the correct answer and a brief explanation if needed.`;
      const result = await evaluationModel.generateContent({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      });
      const evaluation = result.response.text();
      // Extract score and feedback from evaluation
      const score = parseInt(evaluation.match(/\d+/)[0]);
      const feedback = evaluation.replace(/\d+/g, "").trim();
      res.json({ score, feedback });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Save interview session
  saveInterview: async (req, res) => {
    try {
      const {
        name,
        email,
        techStack,
        level,
        questions,
        answers,
        scores,
        feedback,
      } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });
      // Find user by email if provided, else by name
      let user = null;
      if (email) {
        user = await User.findOne({ email });
      }
      if (!user) {
        user = await User.findOne({ name });
      }
      // Prepare interview session
      const totalScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const interviewSession = {
        date: new Date(),
        questions: questions.map((q, i) => ({
          question: q,
          answer: answers[i],
          score: scores[i],
          feedback: feedback[i],
        })),
        totalScore,
        techStack,
        level,
      };
      if (user) {
        if (!user.token || user.token <= 0) {
          return res
            .status(403)
            .json({
              error: "No tokens left. Please buy more tokens to continue.",
            });
        }
        user.techStack = techStack;
        user.token = user.token - 1;
        await user.save();
        res.json({
          message: "Interview saved successfully",
          token: user.token,
        });
      } else {
        user = new User({
          name,
          email:
            email || `${name.toLowerCase().replace(/\s+/g, "")}@noemail.com`,
          techStack,
          interviewHistory: [interviewSession],
          token: 4, // New user, first interview, so 5-1=4
        });
        await user.save();
        res.json({
          message: "Interview saved successfully",
          token: user.token,
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = interviewController;
