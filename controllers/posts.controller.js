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
			const newPost = await prisma.post.create({
				data: {
					title,
					content,
					slug: slugify(`${title}-${Date.now()}`),
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

const getPosts = async (req, res) => {
	try {
		const posts = await prisma.post.findMany();

		res.status(200).json({
			message: 'Posts fetched successfully',
			posts,
		});
	} catch (error) {
		res.status(500).json({
			error: error.message || 'Something went wrong. Try again later.',
		});
	}
};

const getSinglepost = async (req, res) => {
	try {
		const slug = req.params.slug;

		const post = await prisma.post.findUnique({
			where: { slug },
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
};

const editPost = [
	authMiddleware,
	roleMiddleware,
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
	roleMiddleware,
	async (req, res) => {
		try {
			const postId = req.params.postId;

			const post = await prisma.post.findUnique({
				where: { id: postId },
			});

			if (!post) {
				return res.status(404).json({ error: 'Post may have already been deleted' });
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
