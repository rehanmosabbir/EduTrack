import multer from "multer";
import { env } from "../config/env.js";
import { Errors } from "../utils/AppError.js";
import { ALLOWED_NOTE_MIME_TYPES } from "../utils/constants.js";

const storage = multer.memoryStorage();

export const uploadNote = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      ALLOWED_NOTE_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_NOTE_MIME_TYPES)[number],
      )
    ) {
      cb(null, true);
      return;
    }
    cb(Errors.validation(`Unsupported file type: ${file.mimetype}`));
  },
}).single("file");
