const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");
const getNotifications = asyncHandler(async (req, res) => res.json(await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100)));
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true });
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json(notification);
});
module.exports = { getNotifications, markRead };
