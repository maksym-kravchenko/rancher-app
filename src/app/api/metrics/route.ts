import { NextRequest } from "next/server";
import { registry } from "@/lib/metrics";
import { bearerToken, safeEqual } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    // When METRICS_TOKEN is set (production), require a matching bearer token.
    // Prometheus sends it via the ServiceMonitor's `authorization` credentials.
    // When unset (local dev), the endpoint stays open for convenience.
    const expected = process.env.METRICS_TOKEN;
    if (expected) {
        const token = bearerToken(req.headers.get("authorization"));
        if (!token || !safeEqual(token, expected)) {
            return new Response("unauthorized", { status: 401 });
        }
    }

    const metrics = await registry.metrics();
    return new Response(metrics, {
        status: 200,
        headers: {
            "Content-Type": registry.contentType,
        },
    });
}
