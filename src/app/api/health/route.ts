import {httpRequestDuration, httpRequestsTotal} from "@/lib/metrics";

export const dynamic = "force-dynamic";

export async function GET() {
    const end = httpRequestDuration.startTimer({ method: "GET", route: "/api/health" });
    let status = "200";
    try {
        return Response.json({ status: "ok" });
    } catch (err) {
        status = "500";
        throw err;
    } finally {
        httpRequestsTotal.inc({ method: "GET", route: "/api/health", status });
        end({ status });
    }
}