import { ok } from "@/lib/api-response";

export function GET() {
  return ok({ status: "ok" }, "Service is healthy");
}
