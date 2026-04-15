export const roleMiddleware = (req, res, next) => {
	if (req.user.role === 'ADMIN') {
		next();
	} else {
		return res
			.status(403)
			.json({ error: 'Forbidden - You cannot perform this action!' });
	}
};
