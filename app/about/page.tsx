import type { Metadata } from "next";
import { Button, Container, Eyebrow, SectionHeading } from "@/components/ui";
import { CtaBand } from "@/components/CtaBand";
import { Faq } from "@/components/Faq";
import { getSite, getAboutContent, getProducts, getBuyers, getFaqs } from "@/lib/strapi";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutContent();
  return {
    title: about.seo?.metaTitle || "About",
    description: about.seo?.metaDescription,
  };
}

function paragraphs(text: string): string[] {
  return (text || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

export default async function AboutPage() {
  const [site, about, products, buyers, faqs] = await Promise.all([
    getSite(),
    getAboutContent(),
    getProducts(),
    getBuyers(),
    getFaqs("about"),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="hero-mesh">
        <Container className="py-16 lg:py-20">
          <div className="max-w-3xl reveal">
            <Eyebrow>{about.heroEyebrow}</Eyebrow>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-main sm:text-5xl">
              {about.heroTitle} <span className="gold-text">{about.heroTitleHighlight}</span>
            </h1>
            <p className="urdu mt-3 text-2xl text-sub" dir="rtl">{site.sloganUrdu}</p>
            <p className="mt-6 text-lg leading-relaxed text-sub">{about.intro}</p>
          </div>
        </Container>
      </section>

      {/* Story */}
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-5 text-base leading-relaxed text-sub reveal">
            {paragraphs(about.storyEn).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {paragraphs(about.storyUr).map((p, i) => (
              <p key={i} className="urdu text-lg leading-loose text-main" dir="rtl">
                {p}
              </p>
            ))}
            <ul className="space-y-3 pt-2">
              {about.points.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs text-white">✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 self-start reveal">
            {about.stats.map((s) => (
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
          <SectionHeading center eyebrow={about.productsEyebrow} title={about.productsTitle} subtitle={about.productsSubtitle} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.name} className="reveal rounded-3xl border border-line bg-surface p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <span className="text-3xl">{p.icon}</span>
                  )}
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
        <SectionHeading eyebrow={about.buyersEyebrow} title={about.buyersTitle} />
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
          <SectionHeading center eyebrow={about.faqEyebrow} title={about.faqTitle} />
          <div className="mt-10">
            <Faq items={faqs} />
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
