import type { Metadata } from "next";
import { Container, Eyebrow, SectionHeading } from "@/components/ui";
import { MandiBill } from "@/components/MandiBill";
import { getMandiBillPageContent, getMandiRates } from "@/lib/strapi";
import { buildMandiData } from "@/lib/mandi";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getMandiBillPageContent();
  return {
    title: page.seo?.metaTitle || "Mandi Bill",
    description: page.seo?.metaDescription,
  };
}

export default async function MandiBillPage() {
  const [page, rates] = await Promise.all([getMandiBillPageContent(), getMandiRates()]);
  const { rateMap, latestMonthKey } = buildMandiData(rates);
  const defaultStartDate = latestMonthKey ? `${latestMonthKey}-01` : new Date().toISOString().slice(0, 10);

  return (
    <>
      <section className="hero-mesh">
        <Container className="py-12">
          <div className="max-w-2xl reveal">
            <Eyebrow>{page.heroEyebrow}</Eyebrow>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-main sm:text-5xl">
              {page.heroTitle} <span className="gold-text">{page.heroTitleHighlight}</span>
            </h1>
            <p className="urdu mt-2 text-2xl text-sub" dir="rtl">{page.heroTitleUrdu}</p>
            <p className="mt-5 leading-relaxed text-sub">{page.heroParagraph}</p>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <MandiBill rateMap={rateMap} defaultStartDate={defaultStartDate} />
      </Container>

      {/* How it works */}
      <section className="bg-surface-2/60 py-16">
        <Container>
          <SectionHeading center eyebrow={page.stepsEyebrow} title={page.stepsTitle} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {page.steps.map((s) => (
              <div key={s.number} className="reveal rounded-3xl border border-line bg-surface p-6 shadow-soft">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-brand font-display font-bold text-white">{s.number}</div>
                <h3 className="mt-4 font-semibold text-main">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sub">{s.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
