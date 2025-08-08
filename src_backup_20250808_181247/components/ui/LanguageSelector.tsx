"use client";

import { useState, useEffect } from "react";

type Language = "de" | "en" | "fr" | "tr";

export function LanguageSelector() {
  const [language, setLanguage] = useState<Language>("de");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && ["de", "en", "fr", "tr"].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("language", language);
    // Hier könnte die Sprachänderung implementiert werden
    // z.B. durch einen Context oder Router
  }, [language, mounted]);

  if (!mounted) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <select
      value={language}
      onChange={handleChange}
      className="rounded bg-transparent px-1 text-slate-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900"
      aria-label="Sprache wählen"
    >
      <option value="de" className="bg-slate-900">
        DE
      </option>
      <option value="en" className="bg-slate-900">
        EN
      </option>
      <option value="fr" className="bg-slate-900">
        FR
      </option>
      <option value="tr" className="bg-slate-900">
        TR
      </option>
    </select>
  );
}
