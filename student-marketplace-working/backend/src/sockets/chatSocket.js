const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Project = require("../models/Project");
const Message = require("../models/Message");
module.exports = function registerChatSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id name");
      if (!user) return next(new Error("Unauthorized"));
      socket.user = user;
      next();
    } catch (_) { next(new Error("Unauthorized")); }
  });
  io.on("connection", (socket) => {
    socket.on("joinProject", async (projectId, ack = () => {}) => {
      try {
        const project = await Project.findById(projectId);
        if (!project || (!project.owner.equals(socket.user._id) && !project.selectedDoer?.equals(socket.user._id))) return ack({ error: "Forbidden" });
        socket.join(String(project._id)); ack({ ok: true });
      } catch (_) { ack({ error: "Unable to join project chat" }); }
    });
    socket.on("sendMessage", async (payload = {}, ack = () => {}) => {
      try {
        const { projectId, text } = payload;
        if (typeof text !== "string" || !text.trim() || text.trim().length > 4000) return ack({ error: "Message must be 1–4,000 characters." });
        const project = await Project.findById(projectId);
        if (!project || (!project.owner.equals(socket.user._id) && !project.selectedDoer?.equals(socket.user._id))) return ack({ error: "Forbidden" });
        const recipient = project.owner.equals(socket.user._id) ? project.selectedDoer : project.owner;
        if (!recipient) return ack({ error: "Project has no selected collaborator." });
        const message = await Message.create({ project: project._id, sender: socket.user._id, recipient, text: text.trim() });
        io.to(String(project._id)).emit("receiveMessage", message); ack({ ok: true, message });
      } catch (_) { ack({ error: "Unable to send message" }); }
    });
  });
};
