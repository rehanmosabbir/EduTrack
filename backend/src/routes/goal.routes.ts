import { Router } from "express";
import * as goalController from "../controllers/goal.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/errorHandler.js";
import { goalSchema, updateGoalSchema } from "../validators/schemas.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);

router.get("/", goalController.list);
router.get("/:id", goalController.getById);
router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  validateBody(goalSchema),
  goalController.create,
);
router.put(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  validateBody(updateGoalSchema),
  goalController.update,
);
router.delete(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  goalController.remove,
);

export default router;
