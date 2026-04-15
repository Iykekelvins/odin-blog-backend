import { Router } from 'express';
import { createPost, getPosts } from '../controllers/posts.controller.js';

const router = Router();

router.post('/', createPost);
router.get('/', getPosts);

export default router;
