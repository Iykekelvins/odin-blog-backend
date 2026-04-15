import { matchedData, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { validateComment } from '../lib/validators.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const addComment = [
	authMiddleware,
	validateComment,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				error: errors.array()[0].msg,
			});
		}

		const { content } = matchedData(req);

		try {
			const postId = req.params.postId;

			const post = await prisma.post.findUnique({
				where: { id: postId },
			});

			if (!post) {
				return res.status(404).json({ error: 'Post does not exist' });
			}

			await prisma.comment.create({
				data: {
					authorId: req.user.id,
					postId,
					content,
				},
			});

			res.status(201).json({
				message: 'Comment added successfully',
			});
		} catch (error) {
			res.status(500).json({
				error: error.message || 'Something went wrong. Try again later.',
			});
		}
	},
];

const getComments = [
	async (req, res) => {
		try {
			const postId = req.params.postId;
			const comments = await prisma.comment.findMany({
				where: { postId },
				omit: {
					authorId: true,
				},
				include: {
					author: {
						select: {
							name: true,
							role: true,
						},
					},
				},
			});

			res.json({
				message: 'Comments fetched successfully',
				data: comments,
			});
		} catch (error) {
			res.status(500).json({
				error: error.message || 'Something went wrong. Try again later.',
			});
		}
	},
];

const editComment = [
	authMiddleware,
	async (req, res) => {
		const { content } = req.body;

		try {
			const commentId = req.params.commentId;
			const comment = await prisma.comment.findUnique({
				where: { id: commentId },
			});

			if (!comment) {
				return res.status(404).json({
					error: 'Comment not found',
				});
			}

			if (!content) {
				return res.status(400).json({
					error: 'Content is required',
				});
			}

			if (comment.authorId !== req.user.id) {
				return res.status(403).json({
					error: 'Forbidden - You cannot perform this action!',
				});
			}

			const newComment = await prisma.comment.update({
				where: { id: commentId },
				data: {
					content,
				},
			});

			res.json({
				message: 'Comment updated successfully',
				comment: newComment,
			});
		} catch (error) {
			res.status(500).json({
				error: error.message || 'Something went wrong. Try again later.',
			});
		}
	},
];

const deleteComment = [
	authMiddleware,
	async (req, res) => {
		try {
			const commentId = req.params.commentId;
			const comment = await prisma.comment.findUnique({
				where: { id: commentId },
			});

			if (!comment) {
				return res.status(404).json({
					error: 'Comment may have already been deleted',
				});
			}

			if (req.user.role !== 'ADMIN' && comment.authorId !== req.user.id) {
				return res.status(403).json({
					error: 'Forbidden - You cannot perform this action!',
				});
			}

			await prisma.comment.delete({
				where: { id: commentId },
			});

			res.sendStatus(204);
		} catch (error) {
			res.status(500).json({
				error: error.message || 'Something went wrong. Try again later.',
			});
		}
	},
];

export { addComment, getComments, editComment, deleteComment };
