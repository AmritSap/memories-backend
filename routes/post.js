import express from "express";
const router = express.Router();
import Post from "../model/Post.js";
import isAuthenticated from "../middleware/auth.js";
import User from "../model/User.js";

// CREATE POST
router.post("/", isAuthenticated, async (req, res) => {
  try {
    // const myCloud = await cloudinary.v2.uploader.upload(req.body.images, {
    //   folder: "posts-blogApp",
    // });
    const newPostData = {
      title: req.body.title,
      desc: req.body.desc,
      image: {
        public_id: " myCloud.public_id",
        url: "myCloud.secure_url",
      },
      owner: req.user._id,
    };

    const post = await Post.create(newPostData);

    const user = await User.findById(req.user._id);

    user.posts.unshift(post._id);

    await user.save();

    res.status(201).json({
      status: "success",
      message: "Post created",
      post,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// GET ALL POST
router.get("/all", async (req, res) => {
  try {
    const post = await Post.find();

    post.length > 0
      ? res.status(200).json({
          success: true,
          message: "Here are all the post",
          post,
        })
      : res.status(400).json({
          success: false,
          message: "No post found",
        });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// DELETE POST
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "You can only delete your post",
      });
    }

    // await cloudinary.v2.uploader.destroy(post.image.public_id);

    await post.remove();

    const user = await User.findById(req.user._id);

    const index = user.posts.indexOf(req.params.id);

    user.posts.splice(index, 1);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    post.title = req.body.title;
    post.desc = req.body.desc;

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Your post has been updated",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
