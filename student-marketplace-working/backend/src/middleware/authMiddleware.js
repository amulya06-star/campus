const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return res.status(401).json({ message: "Not authorized, no token." });
  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Not authorized, account no longer exists." });
    req.user = user; return next();
  } catch (error) { return res.status(401).json({ message: "Not authorized, token invalid." }); }
});
const admin = (req, res, next) => req.user?.isAdmin ? next() : res.status(403).json({ message: "Not authorized as admin." });
module.exports = { protect, admin };
