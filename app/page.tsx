import { Button, Container, Eyebrow, SectionHeading, fmt } from "@/components/ui";
import { CtaBand } from "@/components/CtaBand";
import { getSite, getHomeContent, getProducts, getBuyers, getMandiRates } from "@/lib/strapi";
import { buildMandiData } from "@/lib/mandi";

export default async function Home() {
  const [site, home, products, buyers, rates] = await Promise.all([
    getSite(),
    getHomeContent(),
    getProducts(),
    getBuyers(),
    getMandiRates(),
  ]);
  const { latest } = buildMandiData(rates);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero-mesh relative overflow-hidden">
        <Container className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="reveal">
            <Eyebrow>{home.heroEyebrow}</Eyebrow>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-main sm:text-5xl lg:text-6xl">
              {home.heroTitle}{" "}
              <span className="gold-text">{home.heroTitleHighlight}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-sub">{home.heroParagraph}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#products">Explore Products →</Button>
              <Button href="/mandi-bill" variant="outline">🧾 Mandi Bill</Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-sub">
              {home.heroPoints.map((p) => (
                <span key={p} className="flex items-center gap-2">
                  <span className="text-brand-500">✓</span> {p}
                </span>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto aspect-square w-full max-w-md reveal">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-brand-500/15 to-gold/15 blur-2xl" />
            <div className="relative grid h-full place-items-center rounded-[2.5rem] border border-line bg-gradient-to-br from-[color:var(--surface)] to-[color:var(--surface-2)] shadow-card">
              {/* glass of milk */}
              <svg viewBox="0 0 220 240" className="h-[78%] w-[78%] drop-shadow-xl">
                <defs>
                  <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="1" stopColor="#f3ecdd" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="milk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#f6efe0" />
                  </linearGradient>
                </defs>
                {/* splash crown */}
                <path d="M55 70 Q70 30 90 58 Q105 20 120 55 Q138 25 150 60 Q168 40 165 72 L55 72 Z" fill="url(#milk)" opacity="0.85" />
                <circle cx="150" cy="34" r="7" fill="#fff" />
                <circle cx="70" cy="40" r="5" fill="#fff" />
                {/* glass */}
                <path d="M56 70 L164 70 L150 214 Q149 224 139 224 L81 224 Q71 224 70 214 Z" fill="url(#glass)" stroke="var(--color-brand-200)" strokeWidth="2" />
                <path d="M60 74 L160 74 L148 150 L72 150 Z" fill="url(#milk)" />
                <ellipse cx="110" cy="74" rx="52" ry="8" fill="#fff" />
                <rect x="76" y="92" width="10" height="46" rx="5" fill="#fff" opacity="0.6" />
              </svg>

              {/* floating badge */}
              <div className="float-slow absolute left-4 top-6 rounded-2xl border border-line bg-[color:var(--surface)] px-4 py-2.5 shadow-soft">
                <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-gold-600">Since</div>
                <div className="font-display text-2xl font-bold text-brand-700">{site.since}</div>
              </div>
              <div className="float-slow absolute bottom-6 right-4 rounded-2xl border border-line bg-[color:var(--surface)] px-4 py-2.5 shadow-soft" style={{ animationDelay: "1.5s" }}>
                <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-gold-600">Headquarters</div>
                <div className="text-sm font-semibold text-main">{site.city}</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============ MANDI RATE BAND ============ */}
      <Container>
        <div className="reveal -mt-2 overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-600">
                {latest.source}
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <h2 className="font-display text-2xl font-semibold text-main">Today&apos;s Mandi Rate</h2>
                <span className="text-sm text-sub">{latest.label}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <RatePill label="Subah / Mun" value={latest.subah} />
              <RatePill label="Shaam / Mun" value={latest.shaam} />
            </div>
            <div className="flex gap-3">
              <Button href="/mandi-rate" variant="primary">Full rate & history →</Button>
              <Button href="/mandi-bill" variant="outline">Make a bill</Button>
            </div>
          </div>
        </div>
      </Container>

      {/* ============ VALUE PROPS ============ */}
      <Container className="py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {home.valueProps.map((v) => (
            <div key={v.title} className="reveal group rounded-3xl border border-line bg-surface p-7 shadow-soft transition-shadow hover:shadow-card">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-3xl transition-transform group-hover:scale-110 dark:bg-brand-800/40">
                {v.icon}
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-main">{v.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-sub">{v.desc}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* ============ PRODUCTS ============ */}
      <section id="products" className="scroll-mt-24 bg-surface-2/60 py-20">
        <Container>
          <SectionHeading
            center
            eyebrow={home.productsEyebrow}
            title={home.productsTitle}
            subtitle={home.productsSubtitle}
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.name} className="reveal group flex items-start gap-4 rounded-3xl border border-line bg-surface p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-gold-100/60 text-3xl dark:from-brand-800/40 dark:to-gold-700/10">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    p.icon
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-main">{p.name}</h3>
                    <span className="urdu text-sm text-sub">{p.nameUrdu}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-sub">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button href={site.whatsappOrder} external variant="gold">
              💬 Rate & Order — WhatsApp
            </Button>
          </div>
        </Container>
      </section>

      {/* ============ BUYERS ============ */}
      <Container className="py-20">
        <SectionHeading
          eyebrow={home.buyersEyebrow}
          title={home.buyersTitle}
        />
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

      <CtaBand />
    </>
  );
}

function RatePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-brand-50 px-5 py-3 text-center dark:bg-brand-800/40">
      <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-gold-600">{label}</div>
      <div className="font-display text-2xl font-bold text-brand-700 dark:text-brand-100">Rs {fmt(value)}</div>
    </div>
  );
}
