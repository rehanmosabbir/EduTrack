import { Router } from "express";
import * as studyLogController from "../controllers/studyLog.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/errorHandler.js";
import { studyLogSchema } from "../validators/schemas.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);

router.get("/stats", studyLogController.stats);
router.get("/trend", studyLogController.trend);
router.get("/calendar", studyLogController.calendar);
router.get("/", studyLogController.list);
router.get("/:id", studyLogController.getById);
router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  validateBody(studyLogSchema),
  studyLogController.create,
);
router.put(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  validateBody(studyLogSchema.partial()),
  studyLogController.update,
);
router.delete(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  studyLogController.remove,
);

export default router;
