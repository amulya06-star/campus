const asyncHandler = require("express-async-handler");
const Message = require("../models/Message");
const Project = require("../models/Project");
async function requireParticipant(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) return { error: 404, message: "Project not found" };
  if (!project.owner.equals(userId) && !project.selectedDoer?.equals(userId)) return { error: 403, message: "Only project participants can access this conversation." };
  return { project };
}
const getMessages = asyncHandler(async (req, res) => {
  const access = await requireParticipant(req.params.projectId, req.user._id);
  if (access.error) return res.status(access.error).json({ message: access.message });
  res.json(await Message.find({ project: req.params.projectId }).sort({ createdAt: 1 }).populate("sender", "name").populate("recipient", "name"));
});
const sendMessage = asyncHandler(async (req, res) => {
  const access = await requireParticipant(req.params.projectId, req.user._id);
  if (access.error) return res.status(access.error).json({ message: access.message });
  const { text } = req.body;
  if (typeof text !== "string" || !text.trim() || text.trim().length > 4000) return res.status(400).json({ message: "Message must be 1–4,000 characters." });
  const recipient = access.project.owner.equals(req.user._id) ? access.project.selectedDoer : access.project.owner;
  const message = await Message.create({ project: access.project._id, sender: req.user._id, recipient, text: text.trim() });
  res.status(201).json(message);
});
module.exports = { getMessages, sendMessage, requireParticipant };
