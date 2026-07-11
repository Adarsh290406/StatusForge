"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What is a status page?",
    a: "A public page that displays the current health of your services so customers know if something is wrong — before they need to contact support.",
  },
  {
    q: "Is StatusForge free?",
    a: "Yes, it's open-source under the MIT licence. You host it yourself, so you only pay for your own infrastructure (e.g. Vercel free tier + Supabase free tier).",
  },
  {
    q: "How does auto-detection work?",
    a: "If a service is marked as Down and no incident is created for 5 minutes, StatusForge automatically creates a draft incident — so nothing slips through the cracks even if the on-call engineer is slow to respond.",
  },
  {
    q: "Can I embed the status page in my own site?",
    a: "Absolutely. The status page lives at a standalone URL you can link, iframe, or redirect to from your own domain at any time.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 shadow-sm">
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-colors"
            aria-expanded={open === i}
          >
            <span>{faq.q}</span>
            <span
              aria-hidden
              className={`ml-4 shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${open === i ? "rotate-45" : ""}`}
            >
              +
            </span>
          </button>

          {open === i && (
            <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {faq.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
