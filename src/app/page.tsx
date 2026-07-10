import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-zinc-250 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛠️</span>
          <span className="text-base font-bold tracking-tight text-zinc-900">StatusForge</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/status"
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900"
          >
            Live Status
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition-colors"
          >
            Admin Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 text-center space-y-12">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-150 px-3 py-1 text-xs font-semibold text-zinc-850">
            ✨ Free & Self-Hosted Incident Tracker
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 leading-tight">
            Clear Communication when <br />
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Systems Go Down.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 max-w-xl mx-auto leading-relaxed">
            StatusForge is a premium, open-source status page and incident tracking dashboard. Broadcast real-time service statuses to your users via Server-Sent Events (SSE) and auto-detect outages.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/status"
            className="w-full sm:w-auto rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800 shadow-md text-center"
          >
            View Live Status Page
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-50 shadow-sm text-center"
          >
            Deploy Admin Console
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <section className="grid sm:grid-cols-3 gap-6 pt-12 border-t border-zinc-200">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 text-left space-y-2 shadow-sm">
            <div className="text-2xl">⚡</div>
            <h3 className="text-sm font-bold text-zinc-900">Real-Time SSE</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Updates status indicators and incident timelines instantly without requiring visitors to refresh the screen.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 text-left space-y-2 shadow-sm">
            <div className="text-2xl">🤖</div>
            <h3 className="text-sm font-bold text-zinc-900">Auto-Detection</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Checks service health every 60 seconds. Automatically generates alerts and reports incidents if downtime exceeds 5 minutes.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 text-left space-y-2 shadow-sm">
            <div className="text-2xl">📊</div>
            <h3 className="text-sm font-bold text-zinc-900">Incident Logs</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Allows search and pagination across resolved incident histories and calculates time-to-resolution dynamically.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white text-center py-6 text-xs text-zinc-400">
        &copy; {new Date().getFullYear()} StatusForge. Self-hosted system status monitoring dashboard.
      </footer>
    </div>
  );
}
