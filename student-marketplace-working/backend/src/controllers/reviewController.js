const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const User = require("../models/User");
const Project = require("../models/Project");
const Notification = require("../models/Notification");
const createReview = asyncHandler(async (req, res) => {
  const { reviewee, rating, comment = "" } = req.body;
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (project.status !== "completed") return res.status(400).json({ message: "Reviews are only available after completion." });
  if (!project.selectedDoer || (!project.owner.equals(req.user._id) && !project.selectedDoer.equals(req.user._id))) return res.status(403).json({ message: "Only project participants may leave a review." });
  const otherParticipant = project.owner.equals(req.user._id) ? project.selectedDoer : project.owner;
  if (!reviewee || !otherParticipant.equals(reviewee)) return res.status(400).json({ message: "You may review only the other project participant." });
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) return res.status(400).json({ message: "Rating must be an integer from 1 to 5." });
  if (typeof comment !== "string" || comment.length > 2000) return res.status(400).json({ message: "Review comment must be 2,000 characters or fewer." });
  const review = await Review.create({ project: project._id, reviewer: req.user._id, reviewee, rating: Number(rating), comment });
  const updated = await User.findByIdAndUpdate(reviewee, { $inc: { ratingCount: 1, ratingTotal: Number(rating) } }, { new: true });
  if (updated) { updated.rating = updated.ratingTotal / updated.ratingCount; await updated.save(); }
  await Notification.create({ user: reviewee, type: "new_review", message: `${req.user.name} left you a ${rating}-star review`, project: project._id });
  res.status(201).json(review);
});
module.exports = { createReview };
