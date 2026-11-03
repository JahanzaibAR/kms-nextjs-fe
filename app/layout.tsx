import type { Metadata } from "next";
import { Geist, Fraunces, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomBar, WhatsAppFab } from "@/components/BottomBar";
import { site } from "@/lib/site";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://gujjarmilkwholesalers.com"),
  title: {
    default: "Karachi Milk Supplier — Khalis Doodh Wholesale Karachi | Since 1982",
    template: "%s | Karachi Milk Supplier",
  },
  description: site.tagline,
  keywords: [
    "doodh wholesale Karachi",
    "milk supplier Karachi",
    "mandi rate doodh",
    "khalis doodh",
    "desi ghee wholesale",
    "Karachi Milk Supplier",
  ],
  openGraph: {
    title: "Karachi Milk Supplier — Khalis Doodh Wholesale Karachi",
    description: site.tagline,
    type: "website",
    locale: "en_PK",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} ${urdu.variable} h-full antialiased`}
    >
      <body className="bg-base text-main flex min-h-full flex-col pb-16 lg:pb-0">
        <LanguageProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <BottomBar />
          <WhatsAppFab />
        </LanguageProvider>
      </body>
    </html>
  );
}
