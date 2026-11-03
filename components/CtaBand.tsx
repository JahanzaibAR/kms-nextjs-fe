"use client";

import { Button, Container } from "./ui";
import { useSite, useCta } from "./SiteProvider";

export function CtaBand() {
  const site = useSite();
  const cta = useCta();
  const subtitle = (cta.subtitle || "").replace("{phone}", site.phone);

  return (
    <Container className="py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand to-brand-800 px-6 py-14 text-center shadow-[0_30px_60px_-30px_rgba(14,107,76,0.8)] sm:px-12">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-brand-300/20 blur-3xl" />
        <div className="relative">
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            {cta.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">{subtitle}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/mandi-rate" variant="gold">
              {cta.rateButtonLabel}
            </Button>
            <Button
              href="/mandi-bill"
              variant="outline"
              className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20"
            >
              {cta.billButtonLabel}
            </Button>
            <Button href={site.whatsappOrder} external variant="outline" className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20">
              {cta.whatsappButtonLabel}
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
