import { body } from 'express-validator';
import { prisma } from './prisma.js';

const alphabetErr = 'must only contain letters';
const nameLengthErr = 'must be between 1 and 50 characters';
const lengthErr = 'must be between 1 and 20 characters';
const emptyErr = 'is required';

const validateSignup = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage(`Name ${emptyErr}`)
		.matches(/^[A-Za-z\s]+$/)
		.withMessage(`Name ${alphabetErr}`)
		.isLength({ min: 1, max: 50 })
		.withMessage(`Name ${nameLengthErr}`),
	body('email')
		.trim()
		.notEmpty()
		.withMessage(`Email ${emptyErr}`)
		.isEmail()
		.withMessage('Invalid email address.')
		.custom(async (email) => {
			const user = await prisma.user.findUnique({ where: { email } });
			if (user) {
				throw new Error('Email already in use');
			}
		}),
	body('password')
		.trim()
		.notEmpty()
		.withMessage(`Password ${emptyErr}`)
		.isLength({ min: 6 })
		.withMessage('Password must be at least 6 characters long'),
];

const validatePost = [
	body('title')
		.trim()
		.notEmpty()
		.withMessage(`Title ${emptyErr}`)
		.isLength({ min: 1, max: 250 })
		.withMessage('Title must be between 1 to 250 characters'),
	body('content').trim().notEmpty().withMessage(`Content ${emptyErr}`),
];

export { validateSignup, validatePost };
