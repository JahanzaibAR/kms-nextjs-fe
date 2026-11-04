import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Karachi Milk Supplier",
    short_name: "Karachi Milk",
    description:
      "Khalis doodh wholesale Karachi — aaj ka mandi rate, mandi bill calculator aur WhatsApp order. Since 1982.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b5a40",
    theme_color: "#0e6b4c",
    lang: "en",
    dir: "ltr",
    categories: ["business", "food", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
