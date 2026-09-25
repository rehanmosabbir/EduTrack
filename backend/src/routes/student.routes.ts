import { Router } from "express";
import * as studentController from "../controllers/student.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/errorHandler.js";
import {
  createStudentSchema,
  updateStudentSchema,
} from "../validators/schemas.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);

router.get("/me/profile", authorize(ROLES.STUDENT), studentController.meProfile);

router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  studentController.list,
);
router.get("/:id", studentController.getById);
router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validateBody(createStudentSchema),
  studentController.create,
);
router.put(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validateBody(updateStudentSchema),
  studentController.update,
);
router.delete(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  studentController.remove,
);

export default router;
