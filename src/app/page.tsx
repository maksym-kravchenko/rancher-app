import type { IconType } from "react-icons";
import {
    FiCheckCircle,
    FiGitCommit,
    FiPackage,
    FiRefreshCw,
    FiTag,
} from "react-icons/fi";
import {
    SiDocker,
    SiGithubactions,
    SiGrafana,
    SiHelm,
    SiHetzner,
    SiKubernetes,
    SiLetsencrypt,
    SiNextdotjs,
    SiNginx,
    SiPrometheus,
    SiRancher,
    SiTailwindcss,
    SiTypescript,
} from "react-icons/si";

export const dynamic = "force-dynamic";

const PIPELINE: { icon: IconType; label: string; sub: string; live?: boolean }[] = [
    { icon: FiGitCommit, label: "Push", sub: "main" },
    { icon: SiGithubactions, label: "Build", sub: "GitHub Actions" },
    { icon: FiPackage, label: "Publish", sub: "ghcr.io" },
    { icon: FiTag, label: "Release", sub: "git tag v*.*.*" },
    { icon: FiRefreshCw, label: "Deploy", sub: "kubectl set image" },
    { icon: FiCheckCircle, label: "Live", sub: "zero downtime", live: true },
];

const FEATURES: { icon: IconType; title: string; text: string }[] = [
    {
        icon: SiKubernetes,
        title: "k8s Cluster",
        text: "Single node k8s on Hetzner Cloud with nginx ingress and automated TLS.",
    },
    {
        icon: SiRancher,
        title: "Selfhosted Rancher",
        text: "Cluster management UI running on the same node it manages.",
    },
    {
        icon: SiGithubactions,
        title: "GitHub Actions CI/CD",
        text: "Build on push, deploy on semver tag. Rolling updates, no rebuilds.",
    },
    {
        icon: SiGrafana,
        title: "Monitoring",
        text: "Prometheus and Grafana with custom app metrics and dashboards.",
    },
];

const STACK: { icon: IconType; name: string; color: string }[] = [
    { icon: SiNextdotjs, name: "Next.js", color: "#ffffff" },
    { icon: SiTypescript, name: "TypeScript", color: "#3178c6" },
    { icon: SiTailwindcss, name: "Tailwind", color: "#38bdf8" },
    { icon: SiDocker, name: "Docker", color: "#2496ed" },
    { icon: SiKubernetes, name: "k8s", color: "#326ce5" },
    { icon: SiRancher, name: "Rancher", color: "#30b3f1" },
    { icon: SiHelm, name: "Helm", color: "#7a8cf8" },
    { icon: SiGithubactions, name: "Actions", color: "#2088ff" },
    { icon: SiPrometheus, name: "Prometheus", color: "#e6522c" },
    { icon: SiGrafana, name: "Grafana", color: "#f46800" },
    { icon: SiNginx, name: "NGINX", color: "#00c46a" },
    { icon: SiLetsencrypt, name: "Let's Encrypt", color: "#f9a825" },
    { icon: SiHetzner, name: "Hetzner", color: "#d50c2d" },
];

export default function Home() {
    const bakedVersion = process.env.APP_VERSION ?? "dev";
    const overrideVersion = process.env.APP_VERSION_OVERRIDE;
    const version = overrideVersion || bakedVersion;
    const podName = process.env.POD_NAME ?? "local";
    const message = process.env.WELCOME_MESSAGE ?? "Hello from local dev";

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950 bg-grid text-white">
            {/* background glows */}
            <div className="pointer-events-none absolute -top-40 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-sky-500/15 blur-3xl" />
            <div className="pointer-events-none absolute top-1/2 -left-40 h-100 w-100 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-16 sm:py-20">
                {/* hero */}
                <section className="rise flex flex-col items-center text-center">
                    <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        </span>
                        Live demo
                    </span>

                    <h1 className="max-w-3xl bg-gradient-to-r from-sky-300 via-white to-emerald-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
                        {message}
                    </h1>
                    <p className="mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
                        A Next.js app on a selfhosted k8s cluster, built, shipped
                        and observed end to end.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
                        <span className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-slate-400">
                            version <span className="text-sky-300">{version}</span>
                        </span>
                        <span className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-slate-400">
                            pod <span className="text-emerald-300">{podName}</span>
                        </span>
                    </div>
                </section>

                {/* CI/CD pipeline animation */}
                <section className="rise mt-20" style={{ animationDelay: "0.15s" }}>
                    <h2 className="mb-10 text-center text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase">
                        From push to production
                    </h2>

                    <div className="relative">
                        {/* track between first and last node centers */}
                        <div className="absolute top-6 right-8 left-8 sm:right-12 sm:left-12">
                            <div className="absolute top-0 h-px w-full bg-slate-800" />
                            <div className="pipeline-fill absolute top-0 h-px bg-gradient-to-r from-sky-400 to-emerald-400" />
                            <div className="pipeline-dot absolute top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300 shadow-[0_0_12px_2px_rgba(56,189,248,0.8)]" />
                        </div>

                        <ol className="relative flex justify-between">
                            {PIPELINE.map((stage, i) => (
                                <li
                                    key={stage.label}
                                    className="flex w-16 flex-col items-center gap-3 sm:w-24"
                                >
                                    <span
                                        className={`stage-node flex h-12 w-12 items-center justify-center rounded-full border ${stage.live ? "stage-node-live" : ""}`}
                                        // stagger: dot crosses 5 segments over 90% of the 12s cycle
                                        style={{ animationDelay: `${i * 2.16}s` }}
                                    >
                                        <stage.icon className="h-5 w-5" />
                                    </span>
                                    <span className="text-center">
                                        <span className="block text-xs font-semibold text-slate-200 sm:text-sm">
                                            {stage.label}
                                        </span>
                                        <span className="mt-0.5 hidden font-mono text-[10px] text-slate-500 sm:block">
                                            {stage.sub}
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* what's running */}
                <section className="rise mt-20" style={{ animationDelay: "0.3s" }}>
                    <h2 className="mb-8 text-center text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase">
                        What&apos;s running
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {FEATURES.map((f) => (
                            <div
                                key={f.title}
                                className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur transition-colors hover:border-slate-600"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-sky-300 transition-colors group-hover:text-emerald-300">
                                        <f.icon className="h-4.5 w-4.5" />
                                    </span>
                                    <h3 className="font-semibold text-slate-100">
                                        {f.title}
                                    </h3>
                                </div>
                                <p className="mt-3 text-sm text-slate-400">{f.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* stack */}
                <section className="rise mt-20" style={{ animationDelay: "0.45s" }}>
                    <h2 className="mb-8 text-center text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase">
                        Stack
                    </h2>
                    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6 sm:gap-x-10">
                        {STACK.map((s) => (
                            <div
                                key={s.name}
                                className="group flex w-16 flex-col items-center gap-2"
                            >
                                <s.icon
                                    className="h-7 w-7 text-slate-500 transition-all duration-200 group-hover:scale-110 group-hover:text-(--brand)"
                                    style={{ "--brand": s.color } as React.CSSProperties}
                                />
                                <span className="text-center text-[10px] text-slate-500 transition-colors group-hover:text-slate-300">
                                    {s.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* footer */}
                <footer className="mt-20 flex flex-col items-center justify-between gap-2 border-t border-slate-800/80 pt-6 text-xs text-slate-500 sm:flex-row">
                    <span>k8s portfolio project · Maksym Kravchenko</span>
                    <span className="font-mono">
                        {version} · {podName}
                    </span>
                </footer>
            </div>
        </main>
    );
}
