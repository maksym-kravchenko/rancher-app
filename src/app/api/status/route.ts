import { NextRequest } from "next/server";
import { httpRequestsTotal, httpRequestDuration } from "@/lib/metrics";
import { safeEqual } from "@/lib/auth";

export const dynamic = "force-dynamic";

const startTime = Date.now();

export async function GET(req: NextRequest) {
    const end = httpRequestDuration.startTimer({ method: "GET", route: "/api/status" });
    const apiKey = req.headers.get("x-api-key");
    const expected = process.env.API_KEY;

    if (!expected || !apiKey || !safeEqual(apiKey, expected)) {
        httpRequestsTotal.inc({ method: "GET", route: "/api/status", status: "401" });
        end({ status: "401" });
        return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = {
        version: process.env.APP_VERSION ?? "dev",
        build: process.env.APP_VERSION,
        pod: process.env.POD_NAME ?? "local",
        uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
        message: process.env.WELCOME_MESSAGE ?? "Hello from local dev",
    };

    httpRequestsTotal.inc({ method: "GET", route: "/api/status", status: "200" });
    end({ status: "200" });
    return Response.json(body);
}