import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);

router.get(
  "/admin",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  dashboardController.adminDashboard,
);
router.get("/student", dashboardController.studentDashboard);

export default router;
