const asyncHandler = require("express-async-handler");
const Application = require("../models/Application");
const Project = require("../models/Project");
const Notification = require("../models/Notification");
const applyToProject = asyncHandler(async (req, res) => {
  const { coverMessage = "", proposedBudget } = req.body;
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (project.status !== "open") return res.status(400).json({ message: "This project is not open for applications." });
  if (project.owner.equals(req.user._id)) return res.status(400).json({ message: "You cannot apply to your own project." });
  if (typeof coverMessage !== "string" || coverMessage.length > 2000) return res.status(400).json({ message: "Cover message must be 2,000 characters or fewer." });
  if (proposedBudget !== undefined && (!Number.isFinite(Number(proposedBudget)) || Number(proposedBudget) <= 0)) return res.status(400).json({ message: "Proposed budget must be positive." });
  const prior = await Application.findOne({ project: project._id, doer: req.user._id });
  if (prior && prior.status !== "withdrawn") return res.status(409).json({ message: "You have already applied to this project." });
  const application = prior ? Object.assign(prior, { coverMessage, proposedBudget, status: "pending" }) : new Application({ project: project._id, doer: req.user._id, coverMessage, proposedBudget });
  await application.save();
  await Notification.create({ user: project.owner, type: "new_application", message: `${req.user.name} applied to “${project.title}”`, project: project._id });
  res.status(201).json(application);
});
const getProjectApplications = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (!project.owner.equals(req.user._id)) return res.status(403).json({ message: "Only the project owner can view applicants." });
  res.json(await Application.find({ project: project._id }).populate("doer", "name college skills rating"));
});
const acceptApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate("project");
  if (!application) return res.status(404).json({ message: "Application not found" });
  const project = application.project;
  if (!project.owner.equals(req.user._id)) return res.status(403).json({ message: "Only the project owner can accept applicants." });
  if (project.status !== "open" || project.selectedDoer) return res.status(409).json({ message: "This project is no longer accepting applicants." });
  if (application.status !== "pending") return res.status(409).json({ message: "This application is no longer pending." });
  const claimedProject = await Project.findOneAndUpdate(
    { _id: project._id, owner: req.user._id, status: "open", selectedDoer: null },
    { $set: { selectedDoer: application.doer, status: "in_progress" } },
    { new: true }
  );
  if (!claimedProject) return res.status(409).json({ message: "This project is no longer accepting applicants." });
  application.status = "accepted";
  await Promise.all([
    application.save(),
    Application.updateMany({ project: project._id, _id: { $ne: application._id }, status: "pending" }, { status: "rejected" }),
  ]);
  await Notification.create({ user: application.doer, type: "application_accepted", message: `You were selected for “${project.title}”`, project: project._id });
  res.json({ application, project: claimedProject });
});
const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ message: "Application not found" });
  if (!application.doer.equals(req.user._id)) return res.status(403).json({ message: "You can only withdraw your own application." });
  if (application.status !== "pending") return res.status(409).json({ message: "Only pending applications can be withdrawn." });
  application.status = "withdrawn"; await application.save(); res.json(application);
});
module.exports = { applyToProject, getProjectApplications, acceptApplication, withdrawApplication };
