const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const interviewSessionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  questions: [
    {
      question: String,
      answer: String,
      score: Number,
      feedback: String,
    },
  ],
  totalScore: Number,
  techStack: String,
  level: String,
});

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
    },
    phone: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    token: {
      type: Number,
      default: 5,
    },
    interviewHistory: [interviewSessionSchema],
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
