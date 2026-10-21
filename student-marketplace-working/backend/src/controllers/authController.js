const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const userResponse = (user) => ({ _id: user._id, name: user.name, email: user.email, college: user.college, skills: user.skills, token: generateToken(user._id) });
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, college, skills } = req.body;
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) return res.status(400).json({ message: "Name must be 2–80 characters." });
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
  if (typeof password !== "string" || password.length < 8 || password.length > 128) return res.status(400).json({ message: "Password must be 8–128 characters." });
  if (college !== undefined && (typeof college !== "string" || college.length > 120)) return res.status(400).json({ message: "College must be 120 characters or fewer." });
  if (skills !== undefined && !Array.isArray(skills)) return res.status(400).json({ message: "Skills must be a list." });
  const normalizedEmail = email.toLowerCase().trim();
  if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "An account with this email already exists." });
  const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12), college, skills: (skills || []).slice(0, 30) });
  res.status(201).json(userResponse(user));
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ message: "Email and password are required." });
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password." });
  res.json(userResponse(user));
});
const getMe = asyncHandler(async (req, res) => res.json(req.user));
module.exports = { registerUser, loginUser, getMe };
