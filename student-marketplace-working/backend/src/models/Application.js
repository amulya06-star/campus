const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    doer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverMessage: { type: String, trim: true },
    proposedBudget: { type: Number },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// A doer can only apply once per project
applicationSchema.index({ project: 1, doer: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
