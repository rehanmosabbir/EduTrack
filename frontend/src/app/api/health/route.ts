import { jsonSuccess } from "@/server/api/http";

export async function GET() {
  return jsonSuccess({ status: "ok" });
}
