import express from "express";
import { isAuth } from "../middleware/auth.middleware.js";
import { AuthController } from "../controller/auth.controller.js";

const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/regenerate-token', AuthController.createAccessFromRefreshToken);
router.get('/logout', isAuth, AuthController.logOut);

export default router;