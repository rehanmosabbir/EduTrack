import fs from "fs";
import path from "path";
import { env } from "@/server/config/env";

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { path: parts } = await ctx.params;
  const fileName = path.basename(parts.join("/"));
  const full = path.join(path.resolve(env.UPLOAD_DIR), fileName);

  if (!fs.existsSync(full)) {
    return new Response("Not found", { status: 404 });
  }

  const data = fs.readFileSync(full);
  return new Response(data, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
