import { Button, Container } from "./ui";
import { site } from "@/lib/site";

export function CtaBand() {
  return (
    <Container className="py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand to-brand-800 px-6 py-14 text-center shadow-[0_30px_60px_-30px_rgba(14,107,76,0.8)] sm:px-12">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-brand-300/20 blur-3xl" />
        <div className="relative">
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            Aaj ka Rate Dekhein ya Order Karein
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Khalis doodh, seedha mandi rate par — 24/7 order {site.phone} par.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/mandi-rate" variant="gold">
              📊 Aaj ka Mandi Rate
            </Button>
            <Button
              href="/mandi-bill"
              variant="outline"
              className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20"
            >
              🧾 Mandi Bill Banayein
            </Button>
            <Button href={site.whatsappOrder} external variant="outline" className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20">
              💬 WhatsApp par Order
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
