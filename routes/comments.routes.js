import { Router } from 'express';
import {
	addComment,
	deleteComment,
	editComment,
	getComments,
} from '../controllers/comments.controller.js';

const router = Router();

router.get('/:postId', getComments);
router.post('/:postId', addComment);
router.patch('/:commentId', editComment);
router.delete('/:commentId/delete', deleteComment);

export default router;
