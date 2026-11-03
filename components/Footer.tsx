import Link from "next/link";
import { nav, site } from "@/lib/site";
import { Logo } from "./Logo";

const socials = [
  { href: site.social.instagram, label: "Instagram", d: "M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.2 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.42 2.2 8.8 2.2 12 2.2zm0 3.5a6.3 6.3 0 100 12.6 6.3 6.3 0 000-12.6zm0 10.4a4.1 4.1 0 110-8.2 4.1 4.1 0 010 8.2zm6.5-10.65a1.47 1.47 0 11-2.95 0 1.47 1.47 0 012.95 0z" },
  { href: site.social.facebook, label: "Facebook", d: "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.9 3.78-3.9 1.1 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22C18.34 21.24 22 17.08 22 12.06z" },
  { href: site.social.linkedin, label: "LinkedIn", d: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0z" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-sub">
            {site.since} se Karachi ki dukanon, hotels aur gharon ko khalis bhains aur gaye ka doodh, dahi, malai aur desi ghee — roz ke mandi rate par.
          </p>
          <div className="mt-5 flex gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-line text-sub transition-colors hover:border-brand hover:bg-brand hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current">
                  <path d={s.d} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-600">
            Quick Links
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-sub transition-colors hover:text-brand-700">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div id="contact">
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-600">
            Contact
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-sub">
            <li>
              <a href={`tel:${site.phoneDigits}`} className="flex items-center gap-2 hover:text-brand-700">
                <span>📞</span> {site.phone}
              </a>
            </li>
            <li>
              <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-brand-700">
                <span>💬</span> WhatsApp: {site.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span>📍</span>
              <a href={site.address1Map} target="_blank" rel="noopener noreferrer" className="hover:text-brand-700">
                {site.address1}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span>📍</span> {site.address2}
            </li>
            <li className="flex items-center gap-2">
              <span>🕐</span> {site.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-sub sm:flex-row sm:px-6">
          <p>© 2026 {site.name}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="urdu">{site.sloganUrdu}</span>
            <span>· Est. {site.since}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
