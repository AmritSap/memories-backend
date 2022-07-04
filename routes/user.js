import express from "express";
const router = express.Router();
import User from "../model/User.js";
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

// GET USER PORFILE
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

export default router;
