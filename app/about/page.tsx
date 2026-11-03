import type { Metadata } from "next";
import { Button, Container, Eyebrow, SectionHeading } from "@/components/ui";
import { CtaBand } from "@/components/CtaBand";
import { Faq } from "@/components/Faq";
import { site, products, buyers, stats, aboutFaqs } from "@/lib/site";

export const metadata: Metadata = {
  title: "About — Karachi ka Apna Milk Supplier | Since 1982, Karachi",
  description:
    "Since 1982, Karachi Milk Supplier supplies khalis doodh, dahi, malai, makhan and ghee to shops, hotels and caterers across Karachi — at the day’s honest mandi rate.",
};

const points = [
  "Open 24/7 — din ho ya raat, order anytime on call or WhatsApp.",
  "Mandi rate, saaf aur seedha — milk priced at today’s mandi rate (subah aur shaam), never inflated.",
  "Flexible payment — pay online, by bank transfer, or cash on delivery.",
  "Karachi delivery — fresh milk delivered daily to Karachi and nearby areas.",
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-mesh">
        <Container className="py-16 lg:py-20">
          <div className="max-w-3xl reveal">
            <Eyebrow>Our Story · Since 1982</Eyebrow>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-main sm:text-5xl">
              Karachi ka Apna <span className="gold-text">Milk Supplier</span>
            </h1>
            <p className="urdu mt-3 text-2xl text-sub" dir="rtl">{site.sloganUrdu}</p>
            <p className="mt-6 text-lg leading-relaxed text-sub">
              Dukandaron ka Bharosa — Karachi&apos;s trusted milk wholesaler since 1982.
            </p>
          </div>
        </Container>
      </section>

      {/* Story */}
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-5 text-base leading-relaxed text-sub reveal">
            <p>
              Since 1982, <strong className="text-main">Karachi Milk Supplier</strong> has been
              supplying khalis doodh — fresh buffalo milk and cow milk — along with dahi, malai,
              makhan and ghee to shops, hotels, tea stalls and caterers across Karachi. Based in New
              Karachi, we sell at the day&apos;s honest mandi rate and pass the saving on to our
              buyers, with no minimum order and no account required.
            </p>
            <p className="urdu text-lg leading-loose text-main" dir="rtl">
              کراچی میں دودھ کا ہول سیل ہو تو دکاندار سب سے پہلے ہمارا نام لیتے ہیں۔ بھینس کا دودھ ہو
              یا گائے کا، ریٹ وہی جو اس دن منڈی کا ہے — اسی لیے 1982 سے دکانداروں کا بھروسہ قائم ہے۔
            </p>
            <ul className="space-y-3 pt-2">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs text-white">✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 self-start reveal">
            {stats.map((s) => (
              <div key={s.label} className="rounded-3xl border border-line bg-surface p-6 text-center shadow-soft">
                <div className="font-display text-3xl font-bold text-brand-700 dark:text-brand-100">{s.value}</div>
                <div className="mt-1 text-xs font-medium text-sub">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Products */}
      <section className="bg-surface-2/60 py-20">
        <Container>
          <SectionHeading center eyebrow="Hum Kya Supply Karte Hain" title="Wholesale milk and dairy for Karachi" subtitle="Fresh every day." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.name} className="reveal rounded-3xl border border-line bg-surface p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{p.icon}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-main">{p.name}</h3>
                    <span className="urdu text-sm text-sub">{p.nameUrdu}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-sub">{p.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Buyers */}
      <Container className="py-20">
        <SectionHeading eyebrow="Dukandaron ka Bharosa" title="Who buys from Karachi Milk Supplier" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {buyers.map((b) => (
            <div key={b.title} className="reveal rounded-3xl border border-line bg-surface p-6 text-center shadow-soft">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-2xl dark:bg-brand-800/40">{b.icon}</div>
              <h3 className="mt-4 font-semibold text-main">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sub">{b.desc}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* FAQ */}
      <section className="bg-surface-2/60 py-20">
        <Container className="max-w-3xl">
          <SectionHeading center eyebrow="Aksar Pooche Jane Wale Sawal" title="Frequently Asked Questions" />
          <div className="mt-10">
            <Faq items={aboutFaqs} />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={`tel:${site.phoneDigits}`} external>📞 {site.phone}</Button>
            <Button href={site.whatsappOrder} external variant="gold">💬 WhatsApp Order</Button>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
