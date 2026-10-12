const TeamMember = require("../models/TeamMember");
const cloudinary = require("../config/cloudinary");

// ======================================================
// CLOUDINARY UPLOAD HELPER
// ======================================================
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "interior-team",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(buffer);
  });
};

// ======================================================
// GET CLOUDINARY PUBLIC ID FROM IMAGE URL
// ======================================================
const getCloudinaryPublicId = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("res.cloudinary.com")) {
    return null;
  }

  try {
    const url = new URL(imageUrl);

    const parts = url.pathname.split("/");

    // Find "upload" position
    const uploadIndex = parts.indexOf("upload");

    if (uploadIndex === -1) {
      return null;
    }

    // Everything after "upload"
    let publicIdParts = parts.slice(uploadIndex + 1);

    // Remove version part like v123456789
    if (
      publicIdParts.length > 0 &&
      /^v\d+$/.test(publicIdParts[0])
    ) {
      publicIdParts.shift();
    }

    let publicId = publicIdParts.join("/");

    // Remove file extension
    publicId = publicId.replace(/\.[^/.]+$/, "");

    return publicId || null;
  } catch (error) {
    console.error("Failed to extract Cloudinary public ID:", error.message);
    return null;
  }
};

// ======================================================
// DELETE IMAGE FROM CLOUDINARY
// ======================================================
const deleteFromCloudinary = async (imageUrl) => {
  const publicId = getCloudinaryPublicId(imageUrl);

  // Old/local images won't have Cloudinary URL
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    console.log(`Cloudinary image deleted: ${publicId}`);
  } catch (error) {
    console.error(
      "Cloudinary image delete failed:",
      error.message
    );
  }
};

// ======================================================
// IMAGE URL SERIALIZER
// ======================================================
const buildImageUrl = (req, image) => {
  if (!image) return "";

  // New Cloudinary images
  if (
    typeof image === "string" &&
    image.startsWith("http")
  ) {
    return image;
  }

  // Backward compatibility for old local images
  return `${
    process.env.BASE_URL || `${req.protocol}://${req.get("host")}`
  }/uploads/${image}`;
};

// ======================================================
// SERIALIZE TEAM MEMBER
// ======================================================
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

// ======================================================
// GET /api/team
// Active members only
// ======================================================
exports.getTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find({
      isActive: true,
    }).sort({
      order: 1,
      createdAt: 1,
    });

    res.json(
      members.map((member) => serialize(req, member))
    );
  } catch (err) {
    console.error("Get team members error:", err);

    res.status(500).json({
      message: "Failed to fetch team members",
      error: err.message,
    });
  }
};

// ======================================================
// GET /api/team/all
// Admin - all members
// ======================================================
exports.getAllTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find().sort({
      order: 1,
      createdAt: 1,
    });

    res.json(
      members.map((member) => serialize(req, member))
    );
  } catch (err) {
    console.error("Get all team members error:", err);

    res.status(500).json({
      message: "Failed to fetch team members",
      error: err.message,
    });
  }
};

// ======================================================
// GET /api/team/:id
// ======================================================
exports.getTeamMemberById = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        message: "Team member not found",
      });
    }

    res.json(serialize(req, member));
  } catch (err) {
    console.error("Get team member error:", err);

    res.status(500).json({
      message: "Failed to fetch team member",
      error: err.message,
    });
  }
};

// ======================================================
// POST /api/team
// Create team member
// multipart/form-data
// ======================================================
exports.createTeamMember = async (req, res) => {
  try {
    const {
      code,
      name,
      role,
      description,
      order,
      isActive,
    } = req.body;

    // ==================================================
    // SKILLS
    // ==================================================
    let skills = [];

    if (req.body.skills) {
      try {
        skills = JSON.parse(req.body.skills);
      } catch {
        skills = req.body.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    // ==================================================
    // IMAGE UPLOAD
    // ==================================================
    let imageUrl = "";

    if (req.file) {
      console.log("Uploading team image to Cloudinary...");

      const uploadedImage = await uploadToCloudinary(
        req.file.buffer
      );

      imageUrl = uploadedImage.secure_url;

      console.log(
        "Team image uploaded:",
        imageUrl
      );
    }

    // ==================================================
    // CREATE MEMBER
    // ==================================================
    const member = await TeamMember.create({
      code,
      name,
      role,
      description,
      skills,
      order: order ?? 0,
      isActive:
        isActive !== undefined
          ? isActive === "true" || isActive === true
          : true,

      // IMPORTANT:
      // Save permanent Cloudinary URL
      image: imageUrl,
    });

    res.status(201).json(
      serialize(req, member)
    );
  } catch (err) {
    console.error("Create team member error:", err);

    res.status(400).json({
      message: "Failed to create team member",
      error: err.message,
    });
  }
};

// ======================================================
// PUT /api/team/:id
// Update team member
// Image optional
// ======================================================
exports.updateTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(
      req.params.id
    );

    if (!member) {
      return res.status(404).json({
        message: "Team member not found",
      });
    }

    const {
      code,
      name,
      role,
      description,
      order,
      isActive,
    } = req.body;

    // ==================================================
    // BASIC FIELDS
    // ==================================================
    if (code !== undefined) {
      member.code = code;
    }

    if (name !== undefined) {
      member.name = name;
    }

    if (role !== undefined) {
      member.role = role;
    }

    if (description !== undefined) {
      member.description = description;
    }

    if (order !== undefined) {
      member.order = order;
    }

    if (isActive !== undefined) {
      member.isActive =
        isActive === "true" || isActive === true;
    }

    // ==================================================
    // SKILLS
    // ==================================================
    if (req.body.skills) {
      try {
        member.skills = JSON.parse(
          req.body.skills
        );
      } catch {
        member.skills = req.body.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    // ==================================================
    // NEW IMAGE
    // ==================================================
    if (req.file) {
      console.log(
        "New team image received. Uploading to Cloudinary..."
      );

      // Upload new image FIRST
      const uploadedImage = await uploadToCloudinary(
        req.file.buffer
      );

      const newImageUrl =
        uploadedImage.secure_url;

      console.log(
        "New team image uploaded:",
        newImageUrl
      );

      // Delete old Cloudinary image
      if (member.image) {
        await deleteFromCloudinary(
          member.image
        );
      }

      // Save new permanent URL
      member.image = newImageUrl;
    }

    await member.save();

    res.json(
      serialize(req, member)
    );
  } catch (err) {
    console.error("Update team member error:", err);

    res.status(400).json({
      message: "Failed to update team member",
      error: err.message,
    });
  }
};

// ======================================================
// DELETE /api/team/:id
// ======================================================
exports.deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(
      req.params.id
    );

    if (!member) {
      return res.status(404).json({
        message: "Team member not found",
      });
    }

    // ==================================================
    // DELETE CLOUDINARY IMAGE
    // ==================================================
    if (member.image) {
      await deleteFromCloudinary(
        member.image
      );
    }

    // ==================================================
    // DELETE DATABASE RECORD
    // ==================================================
    await member.deleteOne();

    res.json({
      message: "Team member deleted",
    });
  } catch (err) {
    console.error("Delete team member error:", err);

    res.status(500).json({
      message: "Failed to delete team member",
      error: err.message,
    });
  }
};