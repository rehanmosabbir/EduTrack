import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { env } from "../config/env.js";

export interface StoredFile {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
}

export async function storeFile(file: Express.Multer.File): Promise<StoredFile> {
  if (env.STORAGE_PROVIDER === "local") {
    const uploadDir = path.resolve(env.UPLOAD_DIR);
    await fs.mkdir(uploadDir, { recursive: true });
    const safeName = sanitizeFileName(file.originalname);
    const storedName = `${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}`;
    const dest = path.join(uploadDir, storedName);
    await fs.writeFile(dest, file.buffer);
    return {
      fileUrl: `/uploads/${storedName}`,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
    };
  }

  // S3 / Cloudinary hooks — local fallback for v1
  // Architecture-ready: swap provider via STORAGE_PROVIDER
  throw new Error(
    `Storage provider "${env.STORAGE_PROVIDER}" is not fully configured. Use STORAGE_PROVIDER=local for development.`,
  );
}

export async function deleteStoredFile(fileUrl: string): Promise<void> {
  if (env.STORAGE_PROVIDER === "local" && fileUrl.startsWith("/uploads/")) {
    const uploadDir = path.resolve(env.UPLOAD_DIR);
    const fileName = path.basename(fileUrl);
    const full = path.join(uploadDir, fileName);
    try {
      await fs.unlink(full);
    } catch {
      // ignore missing file
    }
  }
}

export function resolveLocalPath(fileUrl: string): string | null {
  if (!fileUrl.startsWith("/uploads/")) return null;
  return path.join(path.resolve(env.UPLOAD_DIR), path.basename(fileUrl));
}
