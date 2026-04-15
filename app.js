import express from 'express';
import 'dotenv/config';

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
import authRouter from './routes/auth.routes.js';
import postsRouter from './routes/posts.routes.js';
import commentsRouter from './routes/comments.routes.js';

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);

const PORT = process.env.PORT || 8001;
app.listen(PORT, (err) => {
	if (err) {
		throw err;
	}

	console.log(`Server running on port: ${PORT}`);
});
