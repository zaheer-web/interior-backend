const fs = require("fs");
const path = require("path");
const TeamMember = require("../models/TeamMember");

const buildImageUrl = (req, filename) => {
  if (!filename) return "";
  return `${process.env.BASE_URL || `${req.protocol}://${req.get("host")}`}/uploads/${filename}`;
};

const serialize = (req, member) => ({
  id: member._id,
  code: member.code,
  name: member.name,
  role: member.role,
  image: buildImageUrl(req, member.image),
  description: member.description,
  skills: member.skills,
  order: member.order,
  isActive: member.isActive,
});

// GET /api/team  — active members only, sorted for display
exports.getTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find({ isActive: true }).sort({
      order: 1,
      createdAt: 1,
    });
    res.json(members.map((m) => serialize(req, m)));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch team members", error: err.message });
  }
};

// GET /api/team/all — everything, including inactive (for an admin panel)
exports.getAllTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ order: 1, createdAt: 1 });
    res.json(members.map((m) => serialize(req, m)));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch team members", error: err.message });
  }
};

// GET /api/team/:id
exports.getTeamMemberById = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Team member not found" });
    res.json(serialize(req, member));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch team member", error: err.message });
  }
};

// POST /api/team  — multipart/form-data with optional "image" file
exports.createTeamMember = async (req, res) => {
  try {
    const { code, name, role, description, order, isActive } = req.body;

    // skills can arrive as a JSON string or comma-separated string
    let skills = [];
    if (req.body.skills) {
      try {
        skills = JSON.parse(req.body.skills);
      } catch {
        skills = req.body.skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    const member = await TeamMember.create({
      code,
      name,
      role,
      description,
      skills,
      order: order ?? 0,
      isActive: isActive !== undefined ? isActive === "true" || isActive === true : true,
      image: req.file ? req.file.filename : "",
    });

    res.status(201).json(serialize(req, member));
  } catch (err) {
    res.status(400).json({ message: "Failed to create team member", error: err.message });
  }
};

// PUT /api/team/:id — multipart/form-data, image optional (replaces old file if sent)
exports.updateTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Team member not found" });

    const { code, name, role, description, order, isActive } = req.body;

    if (code !== undefined) member.code = code;
    if (name !== undefined) member.name = name;
    if (role !== undefined) member.role = role;
    if (description !== undefined) member.description = description;
    if (order !== undefined) member.order = order;
    if (isActive !== undefined) member.isActive = isActive === "true" || isActive === true;

    if (req.body.skills) {
      try {
        member.skills = JSON.parse(req.body.skills);
      } catch {
        member.skills = req.body.skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    if (req.file) {
      // remove the old image file if it exists
      if (member.image) {
        const oldPath = path.join(__dirname, "..", "uploads", member.image);
        fs.existsSync(oldPath) && fs.unlinkSync(oldPath);
      }
      member.image = req.file.filename;
    }

    await member.save();
    res.json(serialize(req, member));
  } catch (err) {
    res.status(400).json({ message: "Failed to update team member", error: err.message });
  }
};

// DELETE /api/team/:id
exports.deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Team member not found" });

    if (member.image) {
      const imgPath = path.join(__dirname, "..", "uploads", member.image);
      fs.existsSync(imgPath) && fs.unlinkSync(imgPath);
    }

    await member.deleteOne();
    res.json({ message: "Team member deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete team member", error: err.message });
  }
};