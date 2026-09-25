import { Router } from "express";
import * as subjectController from "../controllers/subject.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/errorHandler.js";
import {
  createSubjectSchema,
  updateSubjectSchema,
} from "../validators/schemas.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);

router.get("/", subjectController.list);
router.get("/:id", subjectController.getById);
router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validateBody(createSubjectSchema),
  subjectController.create,
);
router.put(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validateBody(updateSubjectSchema),
  subjectController.update,
);
router.delete(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  subjectController.remove,
);

export default router;
