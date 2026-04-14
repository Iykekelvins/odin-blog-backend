import express from 'express';
import 'dotenv/config';

const app = express();

const PORT = process.env.PORT || 8001;
app.listen(PORT, (err) => {
	if (err) {
		throw err;
	}

	console.log(`Server running on port: ${PORT}`);
});
