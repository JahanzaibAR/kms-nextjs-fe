import type { Metadata } from "next";
import { Button, Container, Eyebrow, SectionHeading, fmt } from "@/components/ui";
import { Faq } from "@/components/Faq";
import { MandiRateTable } from "@/components/MandiRateTable";
import { latest } from "@/lib/mandi-data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Aaj ka Doodh ka Mandi Rate Karachi — ${latest.label} | Mushtarika Committee`,
  description:
    "Karachi doodh mandi ka roz ka rate, jaisa Mushtarika Committee ne jaari kiya — subah aur shaam, fi mun. September, October aur November 2026 ke rates aur average.",
};

const faqs = [
  {
    q: "Aaj Karachi mein doodh ka mandi rate kya hai?",
    a: `Mushtarika Committee ke mutabiq ${latest.label} ko subah ka rate Rs ${fmt(latest.subah)} aur shaam ka rate Rs ${fmt(latest.shaam)} fi mun hai.`,
  },
  {
    q: "Yeh rate kaun tay karta hai?",
    a: "Yeh Karachi doodh mandi ka rate hai jo Mushtarika Committee ki taraf se roz subah aur shaam ke liye jaari kiya jata hai. Karachi Milk Supplier yahan wohi rate darj karta hai.",
  },
  {
    q: "Is rate par doodh kahan se milega?",
    a: "Karachi Milk Supplier 1982 se dukanon, hotels aur chai khokon ko mandi rate par khalis doodh deta hai. WhatsApp par order karein: 0308 2979924.",
  },
];

export default function MandiRatePage() {
  return (
    <>
      <section className="hero-mesh">
        <Container className="py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="reveal">
              <Eyebrow>{latest.source}</Eyebrow>
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-main sm:text-5xl">
                Aaj ka Doodh ka <span className="gold-text">Mandi Rate</span>
              </h1>
              <p className="urdu mt-2 text-2xl text-sub" dir="rtl">آج کا دودھ کا منڈی ریٹ</p>
              <p className="mt-5 max-w-xl leading-relaxed text-sub">
                Karachi doodh mandi ka roz ka rate, jaisa <strong className="text-main">Mushtarika Committee</strong> ne jaari kiya — subah aur shaam, fi mun.
              </p>
              <p className="mt-3 text-sm font-medium text-main">{latest.label}</p>
            </div>

            {/* Today's big rate cards */}
            <div className="flex gap-4 reveal">
              <BigRate label="☀ Subah / Mun" value={latest.subah} />
              <BigRate label="🌙 Shaam / Mun" value={latest.shaam} />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/mandi-bill" variant="gold">📄 Is Rate se Mandi Doodh ka Bill Banayein</Button>
            <Button href={site.whatsappOrder} external variant="primary">💬 WhatsApp Order</Button>
          </div>
        </Container>
      </section>

      <Container className="py-14">
        <SectionHeading
          eyebrow="Rates & History"
          title="Daily Mandi Rate — Subah / Shaam"
          subtitle="Mahine chunein — har din ka subah aur shaam ka rate (Rs fi mun) aur us mahine ka average."
        />
        <div className="mt-10">
          <MandiRateTable />
        </div>
      </Container>

      {/* FAQ */}
      <section className="bg-surface-2/60 py-16">
        <Container className="max-w-3xl">
          <SectionHeading center eyebrow="Aksar Pooche Jane Wale Sawal" title="Mandi Rate — FAQs" />
          <div className="mt-8">
            <Faq items={faqs} />
          </div>
        </Container>
      </section>
    </>
  );
}

function BigRate({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-line bg-surface px-6 py-5 text-center shadow-card">
      <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-gold-600">{label}</div>
      <div className="mt-1 font-display text-3xl font-bold text-brand-700 dark:text-brand-100 sm:text-4xl">
        Rs {fmt(value)}
      </div>
    </div>
  );
}
