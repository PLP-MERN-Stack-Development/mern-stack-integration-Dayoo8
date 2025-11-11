const express = require('express');
const router = express.Router();
const Post = require('../server/models/Post');

// ========================
// CREATE a new post
// ========================
router.post('/', async (req, res) => {
  try {
    const { title, content, featuredImage, excerpt, author, category, tags, isPublished } = req.body;

    const newPost = new Post({
      title,
      content,
      featuredImage,
      excerpt,
      author,
      category,
      tags,
      isPublished,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Failed to create post', error: error.message });
  }
});

// ========================
// GET all posts
// ========================
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// ========================
// GET single post by slug
// ========================
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('author', 'name email')
      .populate('category', 'name');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    await post.incrementViewCount();

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// ========================
// UPDATE a post
// ========================
router.put('/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Failed to update post', error: error.message });
  }
});

// ========================
// DELETE a post
// ========================
router.delete('/:id', async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);

    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// ========================
// ADD a comment to a post
// ========================
router.post('/:id/comments', async (req, res) => {
  try {
    const { userId, content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.addComment(userId, content);
    res.status(201).json({ message: 'Comment added', post });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Failed to add comment', error: error.message });
  }
});

// ========================
// INCREMENT view count manually (optional route)
// ========================
router.put('/:id/view', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.incrementViewCount();
    res.status(200).json({ message: 'View count incremented', views: post.viewCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error incrementing view count' });
  }
});

module.exports = router;
