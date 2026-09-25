import { Router } from "express";
import * as noteController from "../controllers/note.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/errorHandler.js";
import { uploadNote } from "../middleware/upload.js";
import { noteMetaSchema } from "../validators/schemas.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);

router.get("/", noteController.list);
router.get("/:id", noteController.getById);
router.get("/:id/download", noteController.download);
router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  uploadNote,
  validateBody(noteMetaSchema),
  noteController.create,
);
router.delete(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  noteController.remove,
);

export default router;
