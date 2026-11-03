import type { Metadata } from "next";
import { Container, Eyebrow, SectionHeading } from "@/components/ui";
import { MandiBill } from "@/components/MandiBill";

export const metadata: Metadata = {
  title: "Mandi Bill Maker — Doodh ka Bill Mandi Rate se Banayein",
  description:
    "Doodh ka bill mandi rate se khud banayein — dukandaar ka naam, tareekh, subah/shaam doodh (mun/kg), commission aur baqaya. PDF ya WhatsApp par bhejein.",
};

const steps = [
  {
    n: 1,
    t: "Naam, tareekh aur din chunein",
    d: "Dukandaar ya Bhenswala ka naam, shuru tareekh aur kitne din chunein — har agli row agli tareekh ki ban jati hai.",
  },
  {
    n: 2,
    t: "Subah / Shaam doodh likhein",
    d: "Har din ki line mein Subah aur Shaam ka doodh Mun aur Kg mein likhein. Us din ka Mushtarika Committee mandi rate khud lag jata hai.",
  },
  {
    n: 3,
    t: "Commission lagayein",
    d: "Net Rate = Mandi Rate + Commission. Commission plus (+200) bhi ho sakta hai aur minus (−1000) bhi.",
  },
  {
    n: 4,
    t: "Bill dekhein ya bhejein",
    d: "Neeche Kul Raqam ban jati hai — phir Bill Dekhein daba kar print karein ya WhatsApp par bhej dein.",
  },
];

export default function MandiBillPage() {
  return (
    <>
      <section className="hero-mesh">
        <Container className="py-12">
          <div className="max-w-2xl reveal">
            <Eyebrow>Mandi Bill Maker</Eyebrow>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-main sm:text-5xl">
              Mandi <span className="gold-text">Bill</span>
            </h1>
            <p className="urdu mt-2 text-2xl text-sub" dir="rtl">منڈی بل</p>
            <p className="mt-5 leading-relaxed text-sub">
              Doodh ka bill mandi rate se khud banayein — tareekh ke hisaab se rate khud lag jata hai.
              Commission lagayein, baqaya jorein, aur PDF ya WhatsApp par bhej dein.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <MandiBill />
      </Container>

      {/* How it works */}
      <section className="bg-surface-2/60 py-16">
        <Container>
          <SectionHeading center eyebrow="Madad" title="Bill Kaise Banta Hai?" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="reveal rounded-3xl border border-line bg-surface p-6 shadow-soft">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-brand font-display font-bold text-white">{s.n}</div>
                <h3 className="mt-4 font-semibold text-main">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sub">{s.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
