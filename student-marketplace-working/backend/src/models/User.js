const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  college: { type: String, trim: true, maxlength: 120 },
  bio: { type: String, trim: true, default: "" }, savedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }], skills: [{ type: String, trim: true }], avatarUrl: { type: String, default: "" },
  rating: { type: Number, default: 0 }, ratingCount: { type: Number, default: 0 }, ratingTotal: { type: Number, default: 0 }, isAdmin: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);
