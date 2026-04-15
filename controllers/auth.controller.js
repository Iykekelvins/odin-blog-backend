import { prisma } from '../lib/prisma.js';
import { validateSignup } from '../lib/validators.js';
import { matchedData, validationResult } from 'express-validator';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const signupController = [
	validateSignup,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				error: errors.array()[0].msg,
			});
		}

		const { name, email, password } = matchedData(req);
		try {
			const hashedPassword = await bcrypt.hash(password, 10);
			const newUser = await prisma.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
				},
			});

			const { password: userPw, ...rest } = newUser;

			res.status(201).json({
				message: 'Account created successfully',
				user: rest,
			});
		} catch (error) {
			res.status(500).json({
				error: error.message || 'Something went wrong. Try again later.',
			});
		}
	},
];

const loginController = async (req, res) => {
	const { email, password } = req.body;

	try {
		if (!email) {
			return res.status(400).json({
				error: 'Email is required',
			});
		}

		if (!password) {
			return res.status(400).json({
				error: 'Password is required',
			});
		}

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return res.status(404).json({
				error: 'Invalid credentials',
			});
		}

		const match = await bcrypt.compare(password, user.password);

		if (!match) {
			return res.status(400).json({
				error: 'Invalid credentials',
			});
		}

		const token = jwt.sign(
			{ id: user.id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: '1d' },
		);

		const { password: userPw, ...rest } = user;

		res.status(200).json({
			message: 'Login successful',
			user: { ...rest, token },
		});
	} catch (error) {
		res.status(500).json({
			error: error.message || 'Something went wrong. Try again later.',
		});
	}
};

export { signupController, loginController };
