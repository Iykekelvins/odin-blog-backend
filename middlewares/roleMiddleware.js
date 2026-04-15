export const roleMiddleware = (req, res, next) => {
	const acceptedRoles = ['AUTHOR', 'ADMIN'];
	if (!acceptedRoles.includes(req.user.role)) {
		return res.status(403).json({ error: 'Forbidden - You cannot create posts!' });
	}
	next();
};
