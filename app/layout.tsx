import type { Metadata, Viewport } from "next";
import { Geist, Fraunces, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SiteProvider } from "@/components/SiteProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomBar, WhatsAppFab } from "@/components/BottomBar";
import { PWARegister } from "@/components/PWARegister";
import { getSite, getCta, getHomeContent } from "@/lib/strapi";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0e6b4c" },
    { media: "(prefers-color-scheme: dark)", color: "#0b3a2a" },
  ],
};

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
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Karachi Milk",
    },
    icons: {
      icon: [
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    },
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
        <PWARegister />
        <SiteProvider site={site} cta={cta}>
          <AuthProvider>
            <LanguageProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <BottomBar />
              <WhatsAppFab />
            </LanguageProvider>
          </AuthProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
