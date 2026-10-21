const asyncHandler = require("express-async-handler");
const Project = require("../models/Project");
const Application = require("../models/Application");
const User = require("../models/User");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const createProject = asyncHandler(async (req, res) => {
  const { title, description, category, technologies = [], budget, deadline, requirements = [] } = req.body;
  if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 120) return res.status(400).json({ message: "Title must be 3–120 characters." });
  if (typeof description !== "string" || description.trim().length < 10 || description.trim().length > 5000) return res.status(400).json({ message: "Description must be 10–5000 characters." });
  if (!Number.isFinite(Number(budget)) || Number(budget) <= 0) return res.status(400).json({ message: "Budget must be a positive number." });
  if (!deadline || !Number.isFinite(Date.parse(deadline)) || new Date(deadline) <= new Date()) return res.status(400).json({ message: "Deadline must be a valid future date." });
  if (!Array.isArray(technologies) || !Array.isArray(requirements)) return res.status(400).json({ message: "Technologies and requirements must be lists." });
  const project = await Project.create({ owner: req.user._id, title: title.trim(), description: description.trim(), category, technologies: technologies.slice(0, 20), budget: Number(budget), deadline, requirements: requirements.slice(0, 30).map((r) => ({ text: String(typeof r === "string" ? r : r.text || "").trim(), done: false })).filter((r) => r.text) });
  res.status(201).json(project);
});
const getProjects = asyncHandler(async (req, res) => {
  const { category, technology, status, search } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (technology) filter.technologies = technology;
  if (status) filter.status = status;
  if (search) filter.title = { $regex: escapeRegex(String(search).slice(0, 100)), $options: "i" };
  const projects = await Project.find(filter).populate("owner", "name college rating").sort({ createdAt: -1 });
  res.json(projects);
});
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate("owner", "name college rating").populate("selectedDoer", "name college rating");
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
});
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (!project.owner.equals(req.user._id)) return res.status(403).json({ message: "Only the project owner can edit it." });
  if (project.status !== "open") return res.status(409).json({ message: "Only open projects can be edited." });
  for (const key of ["title", "description", "requirements", "deadline"]) if (req.body[key] !== undefined) project[key] = req.body[key];
  await project.save();
  res.json(project);
});
const getMyProjects = asyncHandler(async (req, res) => {
  const [owned, applications, user] = await Promise.all([Project.find({ owner: req.user._id }).populate("selectedDoer", "name college").sort({ updatedAt: -1 }), Application.find({ doer: req.user._id }).populate({ path: "project", populate: { path: "owner", select: "name college" } }).sort({ createdAt: -1 }), User.findById(req.user._id).select("savedProjects")]);
  const active = await Project.find({ selectedDoer: req.user._id, status: { $in: ["in_progress", "submitted"] } }).populate("owner", "name college").sort({ updatedAt: -1 });
  const saved = await Project.find({ _id: { $in: user?.savedProjects || [] } }).populate("owner", "name college").sort({ createdAt: -1 });
  res.json({ owned, applications, active, saved });
});
const toggleSavedProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).select("_id");
  if (!project) return res.status(404).json({ message: "Project not found" });
  const user = await User.findById(req.user._id);
  const exists = user.savedProjects.some((id) => id.equals(project._id));
  user.savedProjects = exists ? user.savedProjects.filter((id) => !id.equals(project._id)) : [...user.savedProjects, project._id];
  await user.save();
  res.json({ saved: !exists, projectId: project._id });
});
const getWorkspace = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate("owner", "name college").populate("selectedDoer", "name college");
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (!project.owner._id.equals(req.user._id) && !project.selectedDoer?._id.equals(req.user._id)) return res.status(403).json({ message: "Only project participants can access this workspace." });
  if (!["in_progress", "submitted", "completed"].includes(project.status)) return res.status(409).json({ message: "This project does not have an active workspace." });
  res.json(project);
});
const updateRequirement = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (!project.owner.equals(req.user._id) && !project.selectedDoer?.equals(req.user._id)) return res.status(403).json({ message: "Only project participants can update progress." });
  if (!["in_progress", "submitted"].includes(project.status)) return res.status(409).json({ message: "Progress is locked for this project." });
  const index = Number(req.params.index);
  if (!Number.isInteger(index) || index < 0 || index >= project.requirements.length) return res.status(404).json({ message: "Checklist item not found" });
  project.requirements[index].done = Boolean(req.body.done);
  await project.save();
  res.json(project);
});
const updateProjectStatus = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  const next = req.body.status;
  const owner = project.owner.equals(req.user._id);
  const doer = project.selectedDoer?.equals(req.user._id);
  const allowed = (project.status === "open" && next === "cancelled" && owner) || (project.status === "in_progress" && next === "submitted" && doer) || (project.status === "submitted" && next === "completed" && owner);
  if (!allowed) return res.status(403).json({ message: "That status transition is not allowed for your account." });
  project.status = next;
  await project.save();
  res.json(project);
});
module.exports = { createProject, getProjects, getProjectById, updateProject, getMyProjects, toggleSavedProject, getWorkspace, updateRequirement, updateProjectStatus };
