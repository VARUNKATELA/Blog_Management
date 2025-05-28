import express from "express";
import { isAuth } from "../middleware/auth.middleware.js";
import { BlogController } from "../controller/blog.controller.js";

const router = express.Router();

router.post('/create-blog', isAuth, BlogController.createBlog);
router.get('/get-blog', isAuth, BlogController.getBlog);
router.get('/get-blog-detail', isAuth, BlogController.getBlogDetail);
router.post('/update-blog', isAuth, BlogController.updateBlog);
router.get('/delete-blog', isAuth, BlogController.deleteBlog);

router.get('/delete-document', isAuth, BlogController.deleteDocument);

export default router;