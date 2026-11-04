// Strapi data layer. All reads are cached ('use cache') and tagged "strapi",
// so pages prerender statically and refresh on a timer or via /api/revalidate.
import { cacheLife, cacheTag } from "next/cache";
import type { RateRow } from "./mandi";

const STRAPI_URL =
  process.env.STRAPI_URL || "https://kms-strapi-be-production.up.railway.app";

async function strapiFetch<T>(path: string): Promise<T> {
  "use cache";
  cacheLife("hours");
  cacheTag("strapi");

  const token = process.env.STRAPI_API_TOKEN;
  const res = await fetch(`${STRAPI_URL}/api/${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    throw new Error(`Strapi fetch failed: ${path} -> ${res.status}`);
  }
  const json = await res.json();
  return json.data as T;
}

/* ----------------------------- Types ----------------------------- */

export type Site = {
  name: string;
  logoTop: string;
  logoBottom: string;
  since: string;
  slogan: string;
  sloganUrdu: string;
  tagline: string;
  phone: string;
  phoneDigits: string;
  phoneLocal: string;
  whatsapp: string;
  whatsappOrder: string;
  address1: string;
  address1Map: string;
  address2: string;
  hours: string;
  city: string;
  social: { instagram: string; facebook: string; linkedin: string };
};

export type Product = {
  icon: string;
  name: string;
  nameUrdu: string;
  desc: string;
  imageUrl: string | null;
};

export type Buyer = { icon: string; title: string; desc: string };

export type Faq = { q: string; qUrdu: string; a: string };

export type Stat = { value: string; label: string; labelUrdu: string };

export type ValueProp = { icon: string; title: string; desc: string };

export type Seo = { metaTitle?: string; metaDescription?: string };

export type HomeContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroParagraph: string;
  heroPoints: string[];
  valueProps: ValueProp[];
  productsEyebrow: string;
  productsTitle: string;
  productsSubtitle: string;
  buyersEyebrow: string;
  buyersTitle: string;
  seo: Seo;
};

export type AboutContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroTitleHighlight: string;
  intro: string;
  storyEn: string;
  storyUr: string;
  points: string[];
  stats: Stat[];
  productsEyebrow: string;
  productsTitle: string;
  productsSubtitle: string;
  buyersEyebrow: string;
  buyersTitle: string;
  faqEyebrow: string;
  faqTitle: string;
  seo: Seo;
};

export type MandiRatePageContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroTitleUrdu: string;
  heroParagraph: string;
  tableEyebrow: string;
  tableTitle: string;
  tableSubtitle: string;
  faqEyebrow: string;
  faqTitle: string;
  seo: Seo;
};

export type Step = { number: number; title: string; description: string };

export type MandiBillPageContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroTitleUrdu: string;
  heroParagraph: string;
  stepsEyebrow: string;
  stepsTitle: string;
  steps: Step[];
  seo: Seo;
};

export type CtaContent = {
  title: string;
  subtitle: string;
  rateButtonLabel: string;
  billButtonLabel: string;
  whatsappButtonLabel: string;
};

/* --------------------------- Getters ----------------------------- */

export async function getSite(): Promise<Site> {
  const d = await strapiFetch<any>("general-setting");
  const phoneDigits = (d.phone || "").replace(/\D/g, "");
  const orderText = d.whatsappOrderText || "";
  return {
    name: d.businessName,
    logoTop: d.logoTop,
    logoBottom: d.logoBottom,
    since: d.since,
    slogan: d.slogan,
    sloganUrdu: d.sloganUrdu,
    tagline: d.tagline,
    phone: d.phone,
    phoneDigits,
    phoneLocal: d.phoneLocal,
    whatsapp: `https://wa.me/${phoneDigits}`,
    whatsappOrder: `https://wa.me/${phoneDigits}${
      orderText ? `?text=${encodeURIComponent(orderText)}` : ""
    }`,
    address1: d.address1,
    address1Map: d.address1Map,
    address2: d.address2,
    hours: d.hours,
    city: d.city,
    social: {
      instagram: d.instagram,
      facebook: d.facebook,
      linkedin: d.linkedin,
    },
  };
}

export async function getCta(): Promise<CtaContent> {
  const d = await strapiFetch<any>("cta-band");
  return {
    title: d.title,
    subtitle: d.subtitle,
    rateButtonLabel: d.rateButtonLabel,
    billButtonLabel: d.billButtonLabel,
    whatsappButtonLabel: d.whatsappButtonLabel,
  };
}

export async function getHomeContent(): Promise<HomeContent> {
  const d = await strapiFetch<any>("home-page?populate=*");
  return {
    heroEyebrow: d.heroEyebrow,
    heroTitle: d.heroTitle,
    heroTitleHighlight: d.heroTitleHighlight,
    heroParagraph: d.heroParagraph,
    heroPoints: (d.heroPoints || []).map((p: any) => p.text),
    valueProps: (d.valueProps || []).map((v: any) => ({
      icon: v.icon,
      title: v.title,
      desc: v.description,
    })),
    productsEyebrow: d.productsEyebrow,
    productsTitle: d.productsTitle,
    productsSubtitle: d.productsSubtitle,
    buyersEyebrow: d.buyersEyebrow,
    buyersTitle: d.buyersTitle,
    seo: d.seo || {},
  };
}

export async function getAboutContent(): Promise<AboutContent> {
  const d = await strapiFetch<any>("about-page?populate=*");
  return {
    heroEyebrow: d.heroEyebrow,
    heroTitle: d.heroTitle,
    heroTitleHighlight: d.heroTitleHighlight,
    intro: d.intro,
    storyEn: d.storyEn,
    storyUr: d.storyUr,
    points: (d.points || []).map((p: any) => p.text),
    stats: (d.stats || []).map((s: any) => ({
      value: s.value,
      label: s.label,
      labelUrdu: s.labelUrdu,
    })),
    productsEyebrow: d.productsEyebrow,
    productsTitle: d.productsTitle,
    productsSubtitle: d.productsSubtitle,
    buyersEyebrow: d.buyersEyebrow,
    buyersTitle: d.buyersTitle,
    faqEyebrow: d.faqEyebrow,
    faqTitle: d.faqTitle,
    seo: d.seo || {},
  };
}

export async function getMandiRatePageContent(): Promise<MandiRatePageContent> {
  const d = await strapiFetch<any>("mandi-rate-page?populate=*");
  return {
    heroEyebrow: d.heroEyebrow,
    heroTitle: d.heroTitle,
    heroTitleHighlight: d.heroTitleHighlight,
    heroTitleUrdu: d.heroTitleUrdu,
    heroParagraph: d.heroParagraph,
    tableEyebrow: d.tableEyebrow,
    tableTitle: d.tableTitle,
    tableSubtitle: d.tableSubtitle,
    faqEyebrow: d.faqEyebrow,
    faqTitle: d.faqTitle,
    seo: d.seo || {},
  };
}

export async function getMandiBillPageContent(): Promise<MandiBillPageContent> {
  const d = await strapiFetch<any>("mandi-bill-page?populate=*");
  return {
    heroEyebrow: d.heroEyebrow,
    heroTitle: d.heroTitle,
    heroTitleHighlight: d.heroTitleHighlight,
    heroTitleUrdu: d.heroTitleUrdu,
    heroParagraph: d.heroParagraph,
    stepsEyebrow: d.stepsEyebrow,
    stepsTitle: d.stepsTitle,
    steps: (d.steps || []).map((s: any) => ({
      number: s.number,
      title: s.title,
      description: s.description,
    })),
    seo: d.seo || {},
  };
}

export async function getProducts(): Promise<Product[]> {
  const d = await strapiFetch<any[]>("products?populate=*&sort=order:asc&pagination[pageSize]=100");
  return (d || []).map((p) => ({
    icon: p.icon || "",
    name: p.name,
    nameUrdu: p.nameUrdu || "",
    desc: p.description || "",
    imageUrl: p.image?.url ?? null,
  }));
}

export async function getBuyers(): Promise<Buyer[]> {
  const d = await strapiFetch<any[]>("buyers?sort=order:asc&pagination[pageSize]=100");
  return (d || []).map((b) => ({
    icon: b.icon || "",
    title: b.title,
    desc: b.description || "",
  }));
}

export async function getFaqs(page: "about" | "mandi-rate"): Promise<Faq[]> {
  const d = await strapiFetch<any[]>(
    `faqs?filters[page][$eq]=${page}&sort=order:asc&pagination[pageSize]=200`
  );
  return (d || []).map((f) => ({
    q: f.question,
    qUrdu: f.questionUrdu || "",
    a: f.answer,
  }));
}

export async function getMandiRates(): Promise<RateRow[]> {
  const d = await strapiFetch<any[]>(
    "mandi-rates?sort=date:asc&pagination[pageSize]=1000"
  );
  return (d || []).map((r) => ({ date: r.date, subah: r.subah, shaam: r.shaam }));
}
