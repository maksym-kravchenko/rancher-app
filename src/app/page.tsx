export const dynamic = "force-dynamic";

export default function Home() {
    const version = process.env.APP_VERSION ?? "dev";
    const podName = process.env.POD_NAME ?? "local";
    const message = process.env.WELCOME_MESSAGE ?? "Hello from local dev";

    return (
        <main className="min-h-screen flex flex-col items-center justify-between p-8 bg-gradient-to-br from-slate-900 via-sky-800 to-slate-900 text-white">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-lime-400 via-cyan-700 to-purple-400 bg-clip-text text-transparent">
                    {message}
                </h1>
                <p className="text-xl text-slate-400 max-w-xl">
                    A Kubernetes portfolio project by Maksym Kravchenko
                    deployed on Rancher with GitOps-style CI/CD.
                </p>
            </div>

            <footer className="w-full max-w-2xl border-t border-slate-700 pt-4 mt-12 text-sm text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
                <span>Version: <code className="text-slate-300">{version}</code></span>
                <span>Pod: <code className="text-slate-300">{podName}</code></span>
            </footer>
        </main>
    );
}