import { prisma } from '../lib/prisma.js';
import { validateSignup } from '../lib/validators.js';
import { matchedData, validationResult } from 'express-validator';

import bcrypt from 'bcryptjs';

const signupController = [
	validateSignup,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors);

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
				error: error.message,
			});
		}
	},
];

const loginController = (req, res) => {};

export { signupController, loginController };
