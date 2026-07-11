import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FaqAccordion } from "@/components/faq-accordion";
import { ThemeToggle } from "@/components/theme-toggle";

/* ─── Page-level SEO ─────────────────────────────────── */
export const metadata: Metadata = {
  title: "StatusForge — Self-Hosted Status Page & Incident Tracker",
  description:
    "Keep your users informed with real-time system status and incident timelines. Free, open-source, and self-hosted — no subscriptions.",
  openGraph: {
    title: "StatusForge — Self-Hosted Status Page & Incident Tracker",
    description:
      "Keep your users informed with real-time system status and incident timelines. Free, open-source, and self-hosted.",
    type: "website",
    url: "https://statusforge.vercel.app",
    siteName: "StatusForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "StatusForge — Self-Hosted Status Page & Incident Tracker",
    description:
      "Keep your users informed with real-time system status and incident timelines.",
  },
};

/* ─── FAQ JSON-LD structured data ────────────────────── */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a status page?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A public page that displays the current health of your services so customers know if something is wrong.",
      },
    },
    {
      "@type": "Question",
      name: "Is StatusForge free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, it's open-source under MIT. You host it yourself, so you only pay for your own infrastructure.",
      },
    },
    {
      "@type": "Question",
      name: "How does auto-detection work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If a service is marked Down and no incident is created for 5 minutes, StatusForge auto-creates a draft incident so nothing slips through.",
      },
    },
    {
      "@type": "Question",
      name: "Can I embed the status page in my own site?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. The status page is a standalone URL you can link or iframe anywhere.",
      },
    },
  ],
};

/* ─── Tiny shared primitives ─────────────────────────── */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
      {children}
    </span>
  );
}

function FeatureCard({
  letter,
  title,
  body,
}: {
  letter: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm flex flex-col gap-4">
      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300">
        {letter}
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{body}</p>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-150">
        {/* ── 1. NAV ────────────────────────────────────── */}
        <header className="sticky top-0 z-40 border-b border-gray-200/80 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              StatusForge
            </Link>
            <nav className="flex items-center gap-3">
              <Link
                href="/status"
                className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-colors"
              >
                View Status
              </Link>
              <Link
                href="/login"
                className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-colors"
              >
                Get Started
              </Link>
              <div className="pl-1 border-l border-gray-200 dark:border-gray-800">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </header>

        <main>
          {/* ── 2. HERO ───────────────────────────────────── */}
          <section className="mx-auto max-w-6xl px-6 pb-24 pt-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left copy */}
              <div className="flex flex-col gap-6">
                <Badge>✦ Free &amp; Open‑Source under MIT</Badge>

                <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                  A self‑hosted status page &amp; incident tracker{" "}
                  <span className="text-blue-600 dark:text-blue-400">for teams.</span>
                </h1>

                <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                  Keep your users informed with real‑time system status and
                  incident timelines. No subscriptions, just your own app.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/status"
                    className="rounded-md bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-colors"
                  >
                    View Live Demo Status
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-colors"
                  >
                    Deploy Your Own →
                  </Link>
                </div>

                {/* Live status pill */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                  </span>
                  All systems operational
                </div>
              </div>

              {/* Right: Hero illustration */}
              <div className="flex items-center justify-center lg:h-96">
                <Image
                  src="/hero.jpg"
                  alt="StatusForge cloud database illustration"
                  width={480}
                  height={480}
                  priority
                  className="w-full max-w-sm lg:max-w-none drop-shadow-xl"
                />
              </div>
            </div>
          </section>

          {/* ── 3. HOW IT WORKS ───────────────────────────── */}
          <section className="border-y border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 py-20">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                  How It Works
                </h2>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Up and running in minutes.</p>
              </div>

              <div className="grid gap-8 sm:grid-cols-3">
                {[
                  {
                    n: "01",
                    title: "Add your services",
                    desc: "Register your API, Website, Payments, or any component in the admin portal — takes 30 seconds.",
                  },
                  {
                    n: "02",
                    title: "Update statuses in real time",
                    desc: "Toggle a service to Degraded or Down. Changes stream to every visitor instantly via SSE — no polling.",
                  },
                  {
                    n: "03",
                    title: "Your users see live status — no login",
                    desc: "A fully public, SEO-indexed status page shows current health and incident timelines. Zero friction.",
                  },
                ].map((step) => (
                  <div key={step.n} className="flex flex-col gap-3">
                    <span className="text-5xl font-black text-blue-100 dark:text-gray-800 leading-none select-none">
                      {step.n}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 4. FEATURES ───────────────────────────────── */}
          <section className="py-20">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                  Key Features
                </h2>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Everything you need, nothing you don't.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <FeatureCard
                  letter="⚡"
                  title="Real-time Updates via SSE"
                  body="Status changes appear instantly on the public page using Server-Sent Events — no page refresh needed."
                />
                <FeatureCard
                  letter="📋"
                  title="Incident Timeline"
                  body="Timestamped updates from Investigating → Monitoring → Resolved give users a clear narrative during outages."
                />
                <FeatureCard
                  letter="🤖"
                  title="Auto-Detection"
                  body="A cron job catches unattended outages and auto-creates a draft incident after 5 minutes of downtime."
                />
                <FeatureCard
                  letter="🔍"
                  title="Public History & Search"
                  body="Past incidents with resolution times, fully searchable and paginated. Perfect for SLA reporting."
                />
              </div>
            </div>
          </section>

          {/* ── 5. FAQ ────────────────────────────────────── */}
          <section className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 py-20">
            <div className="mx-auto max-w-3xl px-6">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                  Frequently Asked Questions
                </h2>
              </div>
              <FaqAccordion />
            </div>
          </section>

          {/* ── 6. CTA FOOTER ─────────────────────────────── */}
          <section className="border-t border-gray-200 dark:border-gray-800 py-20">
            <div className="mx-auto max-w-3xl px-6 text-center space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                Ready to own your status communication?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Deploy to Vercel in under 5 minutes. Free forever.
              </p>
              <Link
                href="/signup"
                className="inline-block rounded-md bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-colors"
              >
                Get Started Free
              </Link>

              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-gray-400">
                <a
                  href="https://github.com/Adarsh290406/StatusForge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-700 dark:hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                >
                  GitHub Repo
                </a>
                <Link href="/status" className="hover:text-gray-700 dark:hover:text-white hover:underline">
                  Status Page Demo
                </Link>
                <a
                  href="https://github.com/Adarsh290406/StatusForge/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-700 dark:hover:text-white hover:underline"
                >
                  MIT License
                </a>
              </div>

              <p className="pt-6 text-xs text-gray-300 dark:text-gray-500">
                &copy; {new Date().getFullYear()} StatusForge. Built with Next.js &amp; Drizzle.
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
