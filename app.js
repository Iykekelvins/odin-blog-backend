import express from 'express';
import 'dotenv/config';

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
import authRouter from './routes/auth.routes.js';
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 8001;
app.listen(PORT, (err) => {
	if (err) {
		throw err;
	}

	console.log(`Server running on port: ${PORT}`);
});
