const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
    category: {
      type: String,
      enum: ["Web development", "Mobile apps", "AI & machine learning", "UI/UX design", "Data & analytics", "Other"],
      default: "Other",
    },
    technologies: [{ type: String, trim: true }],
    budget: { type: Number, required: true, min: 1 },
    deadline: { type: Date, required: true },

    // Marketplace lifecycle
    status: {
      type: String,
      enum: ["open", "in_progress", "submitted", "completed", "cancelled"],
      default: "open",
    },

    selectedDoer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Project Workspace checklist
    requirements: [requirementSchema],

    deliverables: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
