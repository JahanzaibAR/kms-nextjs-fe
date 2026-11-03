"use client";

import Link from "next/link";
import { useSite } from "./SiteProvider";

export function BottomBar() {
  const site = useSite();
  const items = [
    { href: "/mandi-rate", icon: "📊", label: "Rate" },
    { href: "/mandi-bill", icon: "🧾", label: "Bill" },
    { href: site.whatsapp, icon: "💬", label: "WhatsApp", external: true },
    { href: `tel:${site.phoneDigits}`, icon: "📞", label: "Call", external: true },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[color:var(--surface)]/90 backdrop-blur-lg lg:hidden">
      <nav className="mx-auto grid max-w-md grid-cols-4">
        {items.map((it) =>
          it.external ? (
            <a
              key={it.label}
              href={it.href}
              target={it.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-0.5 py-2.5 text-[0.7rem] font-medium text-sub active:bg-brand-50"
            >
              <span className="text-lg">{it.icon}</span>
              {it.label}
            </a>
          ) : (
            <Link
              key={it.label}
              href={it.href}
              className="flex flex-col items-center gap-0.5 py-2.5 text-[0.7rem] font-medium text-sub active:bg-brand-50"
            >
              <span className="text-lg">{it.icon}</span>
              {it.label}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}

export function WhatsAppFab() {
  const site = useSite();
  return (
    <a
      href={site.whatsappOrder}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Order"
      className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.8)] transition-transform hover:scale-110 lg:grid"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
        <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.9 9.9 0 004.74 1.2c5.46 0 9.9-4.43 9.9-9.9S17.5 2 12.04 2zm4.5 11.99c-.25-.12-1.47-.72-1.7-.8-.22-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
      </svg>
    </a>
  );
}
