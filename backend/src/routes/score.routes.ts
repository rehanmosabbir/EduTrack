import { Router } from "express";
import * as scoreController from "../controllers/score.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/errorHandler.js";
import { scoreSchema, updateScoreSchema } from "../validators/schemas.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);

router.get("/stats", scoreController.stats);
router.get("/", scoreController.list);
router.get("/:id", scoreController.getById);
router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validateBody(scoreSchema),
  scoreController.create,
);
router.put(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validateBody(updateScoreSchema),
  scoreController.update,
);
router.delete(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  scoreController.remove,
);

export default router;
