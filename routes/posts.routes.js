import { Router } from 'express';
import {
	createPost,
	deletePost,
	editPost,
	getPosts,
	getSinglepost,
} from '../controllers/posts.controller.js';

const router = Router();

router.post('/', createPost);
router.get('/', getPosts);
router.get('/:postId', getSinglepost);
router.patch('/:postId', editPost);
router.delete('/:postId', deletePost);

export default router;
