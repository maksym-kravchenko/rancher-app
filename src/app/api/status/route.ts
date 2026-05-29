import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const startTime = Date.now();

export async function GET(req: NextRequest) {
    const apiKey = req.headers.get("x-api-key");
    const expected = process.env.API_KEY;

    if (!expected || apiKey !== expected) {
        return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    return Response.json({
        version: process.env.APP_VERSION ?? "dev",
        pod: process.env.POD_NAME ?? "local",
        uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
        message: process.env.WELCOME_MESSAGE ?? "Hello from local dev",
    });
}