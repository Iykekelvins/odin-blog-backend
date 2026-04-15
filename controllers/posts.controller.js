import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { prisma } from '../lib/prisma.js';
import { validatePost } from '../lib/validators.js';
import { matchedData, validationResult } from 'express-validator';
import { slugify } from '../lib/helper.js';

const createPost = [
	authMiddleware,
	roleMiddleware,
	validatePost,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				error: errors.array()[0].msg,
			});
		}

		const { title, content } = matchedData(req);

		try {
			// check if slug exists
			let slug = slugify(title);
			const slugs = await prisma.post.findMany({
				where: {
					slug,
				},
			});

			if (slugs.length > 0) {
				slug += `-${slugs.length + 1}`;
			}

			const newPost = await prisma.post.create({
				data: {
					title,
					content,
					slug,
					authorId: req.user.id,
				},
			});

			res.status(201).json({
				message: 'Post created successfully',
				postId: newPost.id,
			});
		} catch (error) {
			res.status(500).json({
				error: error.message || 'Something went wrong. Try again later.',
			});
		}
	},
];

const getPosts = [
	authMiddleware,
	async (req, res) => {
		try {
			const posts = await prisma.post.findMany({
				where: {
					authorId: req.user.id,
				},
				omit: {
					authorId: true,
				},
			});

			res.status(200).json({
				message: 'Posts fetched successfully',
				posts,
			});
		} catch (error) {
			res.status(500).json({
				error: error.message || 'Something went wrong. Try again later.',
			});
		}
	},
];

const getSinglepost = [
	authMiddleware,
	async (req, res) => {
		try {
			const postId = req.params.postId;

			const post = await prisma.post.findUnique({
				where: { id: postId, authorId: req.user.id },
				omit: {
					authorId: true,
				},
			});

			if (!post) {
				return res.status(404).json({ error: 'Post not found' });
			}

			res.status(200).json({
				message: 'Post fetched successfully',
				post,
			});
		} catch (error) {
			res.status(500).json({
				error: error.message || 'Something went wrong. Try again later.',
			});
		}
	},
];

const editPost = [
	authMiddleware,
	async (req, res) => {
		const { title, content } = req.body;

		try {
			const postId = req.params.postId;

			const post = await prisma.post.findUnique({
				where: { id: postId, authorId: req.user.id },
			});

			if (!post) {
				return res.status(404).json({ error: 'Post not found' });
			}

			// check if post belongs to author
			if (post.authorId !== req.user.id) {
				return res
					.status(403)
					.json({ error: 'Forbidden - You cannot edit this post' });
			}

			const updatedPost = await prisma.post.update({
				where: { id: postId },
				data: {
					title,
					content,
				},
				omit: {
					authorId: true,
				},
			});

			res.status(200).json({
				message: 'Post updated successfully',
				post: updatedPost,
			});
		} catch (error) {
			res.status(500).json({
				error: error.message || 'Something went wrong. Try again later.',
			});
		}
	},
];

const deletePost = [
	authMiddleware,
	async (req, res) => {
		try {
			const postId = req.params.postId;

			const post = await prisma.post.findUnique({
				where: { id: postId, authorId: req.user.id },
			});

			if (!post) {
				return res.status(404).json({ error: 'Post not found' });
			}

			// check if post belongs to author
			if (post.authorId !== req.user.id) {
				return res
					.status(403)
					.json({ error: 'Forbidden - You cannot delete this post' });
			}

			await prisma.post.delete({
				where: { id: postId },
			});

			res.sendStatus(204);
		} catch (error) {
			res.status(500).json({
				error: error.message || 'Something went wrong. Try again later.',
			});
		}
	},
];

export { createPost, getPosts, getSinglepost, editPost, deletePost };
