const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;

  const extOk = allowed.test(
    file.originalname.split(".").pop().toLowerCase()
  );

  const mimeOk = allowed.test(file.mimetype);

  if (extOk && mimeOk) {
    return cb(null, true);
  }

  cb(
    new Error(
      "Only .jpeg, .jpg, .png, .webp image files are allowed"
    )
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;