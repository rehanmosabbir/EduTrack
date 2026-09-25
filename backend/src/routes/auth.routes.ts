import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validateBody } from "../middleware/errorHandler.js";
import {
  googleSyncSchema,
  loginSchema,
  registerSchema,
} from "../validators/schemas.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/google-sync",
  authLimiter,
  validateBody(googleSyncSchema),
  authController.googleSync,
);

router.post(
  "/register",
  authLimiter,
  validateBody(registerSchema),
  authController.register,
);

router.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  authController.login,
);

router.get("/me", authenticate, authController.me);

export default router;
