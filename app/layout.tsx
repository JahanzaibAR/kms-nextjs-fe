import type { Metadata } from "next";
import { Geist, Fraunces, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SiteProvider } from "@/components/SiteProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomBar, WhatsAppFab } from "@/components/BottomBar";
import { getSite, getCta, getHomeContent } from "@/lib/strapi";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const urdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu-nastaliq",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [site, home] = await Promise.all([getSite(), getHomeContent()]);
  const title = home.seo?.metaTitle || `${site.name} — Khalis Doodh Wholesale Karachi`;
  const description = home.seo?.metaDescription || site.tagline;
  return {
    metadataBase: new URL("https://gujjarmilkwholesalers.com"),
    title: {
      default: title,
      template: `%s | ${site.name}`,
    },
    description,
    keywords: [
      "doodh wholesale Karachi",
      "milk supplier Karachi",
      "mandi rate doodh",
      "khalis doodh",
      "desi ghee wholesale",
      site.name,
    ],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_PK",
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [site, cta] = await Promise.all([getSite(), getCta()]);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} ${urdu.variable} h-full antialiased`}
    >
      <body className="bg-base text-main flex min-h-full flex-col pb-16 lg:pb-0">
        <SiteProvider site={site} cta={cta}>
          <LanguageProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <BottomBar />
            <WhatsAppFab />
          </LanguageProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
