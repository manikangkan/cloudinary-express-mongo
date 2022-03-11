const router = require("express").Router();
const { route } = require("express/lib/router");
const User = require("../models/user");
const cloudinary = require("../utls/cloudinary");
const upload = require("../utls/multer");

router.get("/", async (req, res) => {
  try {
    var user = await User.find();
    res.json(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    // create a instance of user
    const user = new User({
      name: req.body.name,
      avatar: result.secure_url,
      cloudinary_id: result.public_id,
    });
    // save user to db
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    //   find user by id
    const user = await User.findById(req.params.id);
    // delete image from cloudinary
    await cloudinary.uploader.destroy(user.cloudinary_id);
    // delete user from db
    await user.remove();
    res.json(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    //   find user by id
    const user = await User.findById(req.params.id);
    // delete the image from cloudinary in order to update
    await cloudinary.uploader.destroy(user.cloudinary_id);
    const result = await cloudinary.uploader.upload(req.file.path);
    // update user
    const data = {
      name: req.body.name || user.name,
      avatar: result.secure_url || user.avatar,
      cloudinary_id: result.public_id || user.cloudinary_id,
    };
    user = await User.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
