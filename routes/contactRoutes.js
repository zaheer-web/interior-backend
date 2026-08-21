const express = require("express");
const router = express.Router();
const {
  createContact,
  getAllContacts,
  getContactById,
  markAsRead,
  deleteContact,
} = require("../controllers/contactController");

// Public: submit the contact form
router.post("/", createContact);

// Admin: view every submitted message
router.get("/all", getAllContacts);

router.get("/:id", getContactById);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteContact);

module.exports = router;