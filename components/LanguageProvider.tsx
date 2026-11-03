"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ur";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
};

const LanguageContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gmw-lang") as Lang | null;
      if (saved === "en" || saved === "ur") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("gmw-lang", l);
    } catch {}
  };

  const toggle = () => setLang(lang === "en" ? "ur" : "en");

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

/** Render Roman (en) or Urdu-script (ur) text depending on the active language. */
export function Bi({
  en,
  ur,
  className = "",
  as: Tag = "span",
}: {
  en: React.ReactNode;
  ur?: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const { lang } = useLang();
  if (lang === "ur" && ur) {
    return (
      <Tag className={`urdu ${className}`} dir="rtl">
        {ur}
      </Tag>
    );
  }
  return <Tag className={className}>{en}</Tag>;
}
