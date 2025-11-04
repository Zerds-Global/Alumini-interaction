const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Post = require("../Model/PostModel");
const User = require("../Model/UserModel");
const { authenticate } = require("../Middleware/roleAuth");

const router = express.Router();

// ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Create Post - Only Alumni can create posts
router.post("/", authenticate, upload.single("image"), async (req, res) => {
  try {
    const { heading, description, postType, referenceId, image: bodyImage } = req.body;

    const user = req.user;

    if (user.role !== 'alumni') {
      return res.status(403).json({ error: "Only alumni can create posts" });
    }

    // Use user's collegeId
    const userCollegeId = user.collegeId;
    if (!userCollegeId) {
      return res.status(400).json({ error: "College ID is required" });
    }

    // allow minimal posts; prefer uploaded file, fall back to image path from body
    const image = req.file ? "/uploads/" + req.file.filename : (bodyImage || undefined);

  let authorName = user.name;
  let authorId = user._id;

    const newPost = await Post.create({
      heading,
      description,
      image,
      postType: postType || "general",
      referenceId,
      postedBy: authorName,
      postedById: authorId,
      collegeId: userCollegeId,
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Error creating post" });
  }
});

// Get all posts (optional filter by postType, referenceId, collegeId)
// College-based restriction: admin, alumni, students see only their college posts
// Superadmin sees all posts
router.get("/", authenticate, async (req, res) => {
  try {
    const { postType, referenceId } = req.query;
    const filter = {};
    if (postType) filter.postType = postType;
    if (referenceId) filter.referenceId = referenceId;
    
    // Restrict to user's college for admin, alumni, and students
    // Superadmin can see all
    if (req.user.role === 'admin' || req.user.role === 'alumni' || req.user.role === 'student') {
      if (!req.user.collegeId) {
        return res.status(403).json({ error: "User must be associated with a college" });
      }
      filter.collegeId = req.user.collegeId;
    }
    
    const posts = await Post.find(filter)
      .populate('postedById', 'name email')
      .populate('collegeId', 'name')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Error fetching posts" });
  }
});

// Get single post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Error fetching post" });
  }
});

// Update post - Only alumni who created it or admins from same college can edit
router.put("/:id", authenticate, upload.single("image"), async (req, res) => {
  try {
    const { heading, description } = req.body;
    
    // Get post to check authorization
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

  const user = req.user;

    // Only post creator or admins from same college can edit
    const isCreator = post.postedById.toString() === String(user._id);
    const isSameCollege = user.collegeId && post.collegeId && post.collegeId.toString() === user.collegeId.toString();
    const isAdmin = user.role === 'admin';
    const isSuper = user.role === 'superadmin';

    if (!(isCreator || (isAdmin && isSameCollege) || isSuper)) {
      return res.status(403).json({ error: "Not authorized to update this post" });
    }

    let update = { heading, description };
    if (req.file) update.image = "/uploads/" + req.file.filename;

    const updated = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ error: "Error updating post" });
  }
});

// Delete post - Only post creator or admins from same college can delete
router.delete("/:id", authenticate, async (req, res) => {
  try {
    // Get post to check authorization
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const user = req.user;

    // Only post creator or admins from same college can delete
    const isCreator = post.postedById.toString() === String(user._id);
    const isSameCollege = user.collegeId && post.collegeId && post.collegeId.toString() === user.collegeId.toString();
    const isAdmin = user.role === 'admin';
    const isSuper = user.role === 'superadmin';

    if (!(isCreator || (isAdmin && isSameCollege) || isSuper)) {
      return res.status(403).json({ error: "Not authorized to delete this post" });
    }

    const deleted = await Post.findByIdAndDelete(req.params.id);

    if (deleted.image && deleted.image.startsWith("/uploads/")) {
      const filePath = path.join(uploadsDir, path.basename(deleted.image));
      fs.unlink(filePath, (err) => {});
    }

    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: "Error deleting post" });
  }
});

// Like/Unlike a post - body: { userId }
router.post("/:id/like", authenticate, async (req, res) => {
  try {
    const userId = String(req.user._id);

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Get user to verify they're from the same college
  const user = req.user;

    // Verify user is from same college as post
    if (post.collegeId.toString() !== user.collegeId.toString()) {
      return res.status(403).json({ error: "Not authorized to like posts from other colleges" });
    }

    const idx = post.likes.indexOf(userId);
    if (idx === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(idx, 1);
    }

    await post.save();
    res.json({ likes: post.likes.length, likedByUser: post.likes.includes(userId) });
  } catch (err) {
    console.error("Error updating like:", err);
    res.status(500).json({ error: "Error updating like" });
  }
});

// Comment on a post - body: { userId, text }
router.post("/:id/comment", authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = String(req.user._id);
    if (!text) return res.status(400).json({ error: "text required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Get user to verify they're from the same college
  const user = req.user;

    // Verify user is from same college as post
    if (post.collegeId.toString() !== user.collegeId.toString()) {
      return res.status(403).json({ error: "Not authorized to comment on posts from other colleges" });
    }

    post.comments.push({ userId, text });
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Error adding comment" });
  }
});

// Share a post - increments share count - body: { userId }
router.post("/:id/share", authenticate, async (req, res) => {
  try {
    const userId = String(req.user._id);

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Get user to verify they're from the same college
  const user = req.user;

    // Verify user is from same college as post
    if (post.collegeId.toString() !== user.collegeId.toString()) {
      return res.status(403).json({ error: "Not authorized to share posts from other colleges" });
    }

    post.shares = (post.shares || 0) + 1;
    await post.save();
    res.json({ shares: post.shares });
  } catch (err) {
    console.error("Error sharing post:", err);
    res.status(500).json({ error: "Error sharing post" });
  }
});

module.exports = router;
