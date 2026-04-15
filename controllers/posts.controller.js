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

export { createPost };
