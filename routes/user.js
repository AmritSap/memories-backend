import express from "express";
const router = express.Router();
import User from "../model/User.js";
import Post from "../model/Post.js";
import isAuthenticated from "../middleware/auth.js";

// SIGN UP OR  REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        status: "error",
        message: "User already exits with this email",
      });
    }

    // const myCloud = await cloudinary.v2.uploader.upload(avatar, {
    //   folder: "avatar-blogApp",
    // });
    user = await User.create({
      name,
      email,
      password,
      avatar: { public_id: "myCloud.public_id", url: "myCloud.secure_url " },
    });

    const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(201).cookie("token", token, options).send({
      success: true,
      message: "User registered succesfully",
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// LOGIN USER
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("+password")
      .populate("posts");

    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "User does not exits" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid password" });
    }

    const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(200).cookie("token", token, options).json({
      status: "success",
      message: "Login success",
      user,
      token,
    });
  } catch (error) {
    res.send({
      status: "error",
      message: "Invalid details",
    });
  }
});

//LOGOUT USER
router.get("/logout", async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({
        status: "success",
        message: "Logout success",
      });
  } catch (error) {
    res.send({
      status: "error",
      message: error.message,
    });
  }
});

//GET USER PORFILE
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("posts");
    res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    res.send({
      status: "error",
      message: error.message,
    });
  }
});

//DELETE USER PROFILE
router.delete("/delete", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const posts = user.posts;

    // remove images from cloud data

    // await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    await user.remove();

    // logout user after deleting

    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    // deleting all posts of deleted user

    for (let i = 0; i < posts.length; i++) {
      const post = await Post.findById(posts[i]);
      // await cloudinary.v2.uploader.destroy(post.image.public_id);

      await post.remove();
    }

    res.status(200).json({
      success: true,
      message: "Profile deleted",
    });
  } catch (error) {
    res.send({
      status: "error",
      message: error.message,
    });
  }
});

// UPDATE USER PROFILE
router.put("/update/profile", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { name, email, avatar } = req.body;

    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    // if (avatar) {
    //   await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    //   const myCloud = await cloudinary.v2.uploader.upload(avatar, {
    //     folder: "avatars",
    //   });

    //   user.avatar.public_id = myCloud.public_id;
    //   user.avatar.url = myCloud.secure_url;
    // }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated",
    });
  } catch (error) {
    res.send({
      status: "error",
      message: error.message,
    });
  }
});

//UPDATE USER PASSWORD VIA USER PROFILE
router.put("/update/password", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide old and new password",
      });
    }

    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect old password",
      });
    }
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated",
    });
  } catch (error) {
    res.send({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
