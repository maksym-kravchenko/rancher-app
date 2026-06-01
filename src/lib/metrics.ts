import { Registry, collectDefaultMetrics, Counter, Histogram } from "prom-client";

declare global {
    var __metricsRegistry: Registry | undefined;
    var __httpRequestsTotal: Counter | undefined;
    var __httpRequestDuration: Histogram | undefined;
}

function createRegistry() {
    const registry = new Registry();

    registry.setDefaultLabels({
        app: "rancher-app",
        pod: process.env.POD_NAME ?? "local",
        version: process.env.APP_VERSION ?? "dev",
    });

    collectDefaultMetrics({ register: registry });

    const httpRequestsTotal = new Counter({
        name: "http_requests_total",
        help: "Total HTTP requests received",
        labelNames: ["method", "route", "status"],
        registers: [registry],
    });

    const httpRequestDuration = new Histogram({
        name: "http_request_duration_seconds",
        help: "HTTP request duration in seconds",
        labelNames: ["method", "route", "status"],
        buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
        registers: [registry],
    });

    return { registry, httpRequestsTotal, httpRequestDuration };
}

if (!global.__metricsRegistry) {
    const { registry, httpRequestsTotal, httpRequestDuration } = createRegistry();
    global.__metricsRegistry = registry;
    global.__httpRequestsTotal = httpRequestsTotal;
    global.__httpRequestDuration = httpRequestDuration;
}

export const registry = global.__metricsRegistry!;
export const httpRequestsTotal = global.__httpRequestsTotal!;
export const httpRequestDuration = global.__httpRequestDuration!;