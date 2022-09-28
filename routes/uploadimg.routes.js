const express = require("express");
const router = express.Router();

//middleware
const uploadimg = require("../config/cloudinaray.config");

//localhost:4000/upload-image
router.post("/upload-image", uploadimg.single("picture"), (req, res) => {
  if (!req.file) {
    return res.status(500).json({ message: "Upload image failed" });
  }

  console.log(req.file);

  return res.status(200).json({ url: req.file.path });
});

module.exports = router;
