import type { Metadata } from "next";
import { Button, Container, Eyebrow, SectionHeading, fmt } from "@/components/ui";
import { Faq } from "@/components/Faq";
import { MandiRateTable } from "@/components/MandiRateTable";
import { getSite, getMandiRatePageContent, getMandiRates, getFaqs } from "@/lib/strapi";
import { buildMandiData } from "@/lib/mandi";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getMandiRatePageContent();
  return {
    title: page.seo?.metaTitle || "Mandi Rate",
    description: page.seo?.metaDescription,
  };
}

export default async function MandiRatePage() {
  const [site, page, rates, rawFaqs] = await Promise.all([
    getSite(),
    getMandiRatePageContent(),
    getMandiRates(),
    getFaqs("mandi-rate"),
  ]);
  const { months, latest, latestMonthKey } = buildMandiData(rates);

  // Fill {date}/{subah}/{shaam} placeholders with the latest published rate.
  const faqs = rawFaqs.map((f) => ({
    ...f,
    a: f.a
      .replace(/\{date\}/g, latest.label)
      .replace(/\{subah\}/g, fmt(latest.subah))
      .replace(/\{shaam\}/g, fmt(latest.shaam)),
  }));

  return (
    <>
      <section className="hero-mesh">
        <Container className="py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="reveal">
              <Eyebrow>{page.heroEyebrow || latest.source}</Eyebrow>
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-main sm:text-5xl">
                {page.heroTitle} <span className="gold-text">{page.heroTitleHighlight}</span>
              </h1>
              <p className="urdu mt-2 text-2xl text-sub" dir="rtl">{page.heroTitleUrdu}</p>
              <p className="mt-5 max-w-xl leading-relaxed text-sub">{page.heroParagraph}</p>
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
          eyebrow={page.tableEyebrow}
          title={page.tableTitle}
          subtitle={page.tableSubtitle}
        />
        <div className="mt-10">
          <MandiRateTable months={months} latestMonthKey={latestMonthKey} />
        </div>
      </Container>

      {/* FAQ */}
      <section className="bg-surface-2/60 py-16">
        <Container className="max-w-3xl">
          <SectionHeading center eyebrow={page.faqEyebrow} title={page.faqTitle} />
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
