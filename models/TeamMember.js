const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    // e.g. "AR·01" — the short tag shown on the card front
    code: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    // stored path/filename of the uploaded image (relative to /uploads)
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    // controls card ordering in the grid
    order: {
      type: Number,
      default: 0,
    },
    // lets you hide a member without deleting the record
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamMember", teamMemberSchema);