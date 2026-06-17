# rancher-app

> Kubernetes project: a Next.js application deployed on K3s with Rancher, automated CI/CD via GitHub Actions, and full observability through Prometheus and Grafana.

[![Live App](https://img.shields.io/badge/live-app.kravix.ch-success)](https://app.kravix.ch)
[![Rancher](https://img.shields.io/badge/rancher-rancher.kravix.ch-blue)](https://rancher.kravix.ch)
[![Grafana](https://img.shields.io/badge/grafana-grafana.kravix.ch-orange)](https://grafana.kravix.ch)

## Live endpoints

| Service    | URL                          | Purpose                              |
|------------|------------------------------|--------------------------------------|
| App        | https://app.kravix.ch        | Next.js demo application             |
| Rancher    | https://rancher.kravix.ch    | Kubernetes management UI             |
| Grafana    | https://grafana.kravix.ch    | Metrics dashboards (login required)  |
| Prometheus | https://prometheus.kravix.ch | Metrics queries (basic auth)         |

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      Hetzner Cloud (CPX42)                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    K3s single-node cluster                 │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │  │
│  │  │ rancher-app  │  │   Rancher    │  │ kube-prometheus  │  │  │
│  │  │  namespace   │  │              │  │     -stack       │  │  │
│  │  │              │  │              │  │                  │  │  │
│  │  │  Next.js     │  │ control-plane│  │   Prometheus     │  │  │
│  │  │  pods x2     │  │ UI           │  │   Grafana        │  │  │
│  │  │              │  │              │  │   node-exporter  │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │  │
│  │                                                            │  │
│  │              ingress-nginx + cert-manager                  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
        ▲                                          ▲
        │ HTTPS                                    │ kubectl + Docker push
        │                                          │
   end users                                GitHub Actions
                                            (build + deploy workflows)
```

## Tech stack

**Infrastructure**
- Hetzner Cloud VPS (Ubuntu 24.04)
- K3s - lightweight Kubernetes distribution
- Rancher v2.14 - cluster management UI
- ingress-nginx - HTTP/HTTPS routing
- cert-manager + Let's Encrypt - automated TLS

**Application**
- Next.js 15 (App Router, TypeScript, Tailwind CSS)
- Multi-stage Dockerfile with standalone output
- Non-root container user
- `prom-client` for Prometheus metrics

**CI/CD**
- GitHub Actions (two-workflow setup: build + deploy)
- GHCR (GitHub Container Registry)
- Image re-tagging without rebuild (`docker buildx imagetools`)
- Scoped RBAC ServiceAccount for cluster access
- Semantic versioning via git tags

**Observability**
- kube-prometheus-stack (Helm chart)
- Prometheus with 7-day retention, persistent storage
- Grafana with persistent dashboards
- Custom application metrics (request rate, latency histograms)
- ServiceMonitor for app scraping

## Application features

The Next.js app demonstrates all required Kubernetes concepts:

| Feature | Implementation |
|---------|----------------|
| **ConfigMap** | `WELCOME_MESSAGE` env var injected into pods, displayed as page heading |
| **Secret** | `API_KEY` protects `/api/status`; `METRICS_TOKEN` protects `/api/metrics` (Prometheus scrapes it via the ServiceMonitor's bearer auth) |
| **Resource limits** | `requests: 50m / 128Mi`, `limits: 300m / 256Mi` |
| **Liveness probe** | `GET /api/health` every 10s, restart on 3 consecutive failures |
| **Readiness probe** | `GET /api/health` every 5s, removes pod from load balancer on failure |
| **Pod identity** | Pod name injected via Downward API, shown in page footer |
| **Rolling updates** | Zero-downtime deploys triggered by `kubectl set image` |
| **Horizontal scaling** | 2 replicas with load balancing |
| **Custom metrics** | `http_requests_total` (counter), `http_request_duration_seconds` (histogram) on `/api/metrics` |

### API routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/` | GET | none | Landing page (ConfigMap message, version, pod name) |
| `/api/health` | GET | none | Health check for K8s probes |
| `/api/status` | GET | API key | JSON with version, pod, uptime |
| `/api/metrics` | GET | Bearer token | Prometheus-format metrics (open locally when `METRICS_TOKEN` is unset) |

## CI/CD pipeline

Two-workflow architecture separates building from deploying:

### `build.yml` on push to `main`

1. Checkout source
2. Build Docker image with multi-stage Dockerfile
3. Tag with short SHA (`abc1234`) and `latest`
4. Push to GHCR
5. **Does not deploy**

### `deploy.yml` on push of tag `v*.*.*`

1. Compute semver from tag, look up image by commit SHA
2. Re-tag existing image with semver (no rebuild - uses `docker buildx imagetools create`)
3. Set runtime `APP_VERSION_OVERRIDE` env var
4. `kubectl set image` to deploy the semver-tagged image
5. Wait for rollout to complete
6. Annotate Deployment with the deployed version

```bash
# Day-to-day development
git checkout -b feature/x
# work, commit, push, open PR, merge to main
# build.yml runs, image pushed to GHCR

# Release
git tag v0.3.0
git push origin v0.3.0
# deploy.yml runs, rolling update on cluster
```

### Why two workflows

Splitting build from deploy avoids redundant builds. When the merge commit becomes a tagged release, the deploy workflow finds the existing SHA-tagged image (built earlier on the merge), re-tags it with the semver, and ships it. No double-build, no wasted CI minutes.

## Observability

### Custom metrics

The app instruments every API request with:

- **`http_requests_total`** - counter, labelled by `method`, `route`, `status`, `pod`, `version`
- **`http_request_duration_seconds`** - histogram with buckets from 5ms to 5s, same labels

Plus default Node.js runtime metrics (heap, GC, event loop lag) from `prom-client`.

### Example PromQL queries

```promql
# Request rate per route
rate(http_requests_total[1m])

# p95 latency over 5 minutes
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Container memory usage vs limit
container_memory_working_set_bytes{namespace="rancher-app"}
  / on(pod) kube_pod_container_resource_limits{resource="memory"}

# Pod restart count
kube_pod_container_status_restarts_total{namespace="rancher-app"}
```

## Repository structure

```
.
├── .github/workflows/
│   ├── build.yml              # CI: build & push image to GHCR
│   └── deploy.yml             # CD: deploy semver tag to cluster
├── k8s/
│   ├── namespace.yaml         # rancher-app namespace
│   ├── configmap.yaml         # Non-sensitive app config
│   ├── secret.example.yaml    # Template (real secret.yaml is gitignored)
│   ├── deployment.yaml        # 2 replicas + probes + limits
│   ├── service.yaml           # ClusterIP service
│   ├── ingress.yaml           # TLS + nginx routing for app.kravix.ch
│   ├── servicemonitor.yaml    # Tells Prometheus to scrape /api/metrics
│   ├── cluster-issuer.yaml    # Let's Encrypt prod issuer
│   ├── ci-rbac.yaml           # ServiceAccount + Role for GitHub Actions
│   ├── grafana-ingress.yaml   # TLS + nginx routing for Grafana
│   └── prometheus-ingress.yaml # TLS + basic auth for Prometheus
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx
│   │   └── api/
│   │       ├── health/route.ts
│   │       ├── status/route.ts
│   │       └── metrics/route.ts
│   └── lib/
│       └── metrics.ts         # Prometheus registry & metric definitions
├── Dockerfile                 # Multi-stage build, non-root user, ~200MB final image
├── next.config.ts             # Standalone output enabled
└── package.json
```

## Local development

```bash
npm i

cp .env.local.example .env.local   # then edit values
npm run dev

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/metrics
curl -H "x-api-key: testkey" http://localhost:3000/api/status

# Build container locally
docker build -t rancher-app:dev .
docker run --rm -p 3000:3000 \
  -e APP_VERSION=0.1.0 \
  -e WELCOME_MESSAGE="Hello from Docker" \
  -e API_KEY=testkey \
  -e POD_NAME=local \
  rancher-app:dev
```

## Deployment from scratch

Requirements: a Kubernetes cluster with `ingress-nginx`, `cert-manager`, and `kubectl` access.

```bash
# Create namespace and base resources
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/cluster-issuer.yaml
kubectl apply -f k8s/configmap.yaml

# Create the real secret from the example
cp k8s/secret.example.yaml k8s/secret.yaml
# edit k8s/secret.yaml with a real API key
kubectl apply -f k8s/secret.yaml

# Deploy the app
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Set up CI/CD service account (required for GitHub Actions)
kubectl apply -f k8s/ci-rbac.yaml

# Set up monitoring (requires kube-prometheus-stack already installed)
kubectl apply -f k8s/servicemonitor.yaml
kubectl apply -f k8s/grafana-ingress.yaml
kubectl apply -f k8s/prometheus-ingress.yaml
```

## Versioning strategy

Images carry two tags:
- **Short SHA** (`abc1234`) - built on every push to main, immutable, traceable to commit
- **Semver** (`0.3.0`) - added by the deploy workflow when a `v*` tag is pushed

The Deployment references the semver tag for human-friendly rollbacks:

```bash
# Roll back to a previous version
kubectl set image deployment/rancher-app \
  app=ghcr.io/<owner>/rancher-app:0.2.5 -n rancher-app
```

The page footer shows the deployed semver. `/api/status` exposes both the semver and the underlying SHA for full traceability.

## Possible improvements

Future enhancements that would harden or extend the project:

- **GitOps via ArgoCD or Fleet** - replace `kubectl set image` with pull-based reconciliation
- **HorizontalPodAutoscaler** - auto-scale based on CPU/memory or custom request-rate metrics
- **Alertmanager configuration** - Slack/email alerts on pod restarts, high error rates, certificate expiry
- **Loki for log aggregation** - searchable logs alongside metrics in Grafana
- **Custom Grafana dashboard** - committed as code, provisioned via ConfigMap
- **End-to-end tests** in CI - Playwright against a preview environment before production deploys
- **Backup automation** - `velero` for cluster state, PVC snapshots for Prometheus data

## License

MIT
