"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";

export function ReadAloudToggle() {
  const [isReading, setIsReading] = useState(false);

  const handleClick = () => {
    if (isReading) {
      // Stoppe das Vorlesen
      window.speechSynthesis?.cancel();
      setIsReading(false);
    } else {
      // Starte das Vorlesen des aktuellen Seitentitels
      const pageTitle = document.title || "Seite";
      const utterance = new SpeechSynthesisUtterance(pageTitle);
      utterance.lang = "de-DE";
      utterance.rate = 0.9;
      
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      
      window.speechSynthesis?.speak(utterance);
      setIsReading(true);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="flex items-center gap-1 rounded px-2 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900"
      title="Vorlesen"
      aria-label="Vorlesen"
    >
      <Volume2 className="h-3 w-3" />
      <span className="hidden sm:inline">Vorlesen</span>
    </button>
  );
} 