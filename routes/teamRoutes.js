const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  getTeamMembers,
  getAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require("../controllers/teamController");

// Public: only active members, used by the website
router.get("/", getTeamMembers);

// Admin: everything including inactive members
router.get("/all", getAllTeamMembers);

router.get("/:id", getTeamMemberById);

router.post("/", upload.single("image"), createTeamMember);
router.put("/:id", upload.single("image"), updateTeamMember);
router.delete("/:id", deleteTeamMember);

module.exports = router;