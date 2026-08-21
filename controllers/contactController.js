const Contact = require("../models/Contact");

const serialize = (contact) => ({
  id: contact._id,
  firstName: contact.firstName,
  lastName: contact.lastName,
  email: contact.email,
  phone: contact.phone,
  subject: contact.subject,
  message: contact.message,
  isRead: contact.isRead,
  createdAt: contact.createdAt,
});

// POST /api/ma-architect/contact — public, called from the site's contact form
exports.createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;

    if (!firstName || !lastName || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const contact = await Contact.create({
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
    });

    res.status(201).json(serialize(contact));
  } catch (err) {
    res.status(400).json({ message: "Failed to send message", error: err.message });
  }
};

// GET /api/ma-architect/contact/all — everything, for an admin panel
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts.map(serialize));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err.message });
  }
};

// GET /api/ma-architect/contact/:id
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Message not found" });
    res.json(serialize(contact));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch message", error: err.message });
  }
};

// PATCH /api/ma-architect/contact/:id/read — mark a message as reviewed
exports.markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Message not found" });

    contact.isRead = true;
    await contact.save();

    res.json(serialize(contact));
  } catch (err) {
    res.status(500).json({ message: "Failed to update message", error: err.message });
  }
};

// DELETE /api/ma-architect/contact/:id
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Message not found" });

    await contact.deleteOne();
    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete message", error: err.message });
  }
};