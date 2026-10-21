const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "new_application",
        "application_accepted",
        "application_rejected",
        "new_message",
        "work_submitted",
        "project_approved",
        "new_review",
      ],
      required: true,
    },
    message: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
