import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  STORAGE_PROVIDER: z.enum(["local", "s3", "cloudinary"]).default("local"),
  STORAGE_ACCESS_KEY: z.string().optional().default(""),
  STORAGE_SECRET_KEY: z.string().optional().default(""),
  STORAGE_BUCKET: z.string().optional().default(""),
  STORAGE_REGION: z.string().optional().default(""),
  STORAGE_ENDPOINT: z.string().optional().default(""),
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

let cached: z.infer<typeof envSchema> | undefined;

function readEnv() {
  if (!cached) cached = envSchema.parse(process.env);
  return cached;
}

export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get(_target, prop) {
    const value = readEnv()[prop as keyof z.infer<typeof envSchema>];
    return value;
  },
});
