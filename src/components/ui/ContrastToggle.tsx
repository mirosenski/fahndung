"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

export function ContrastToggle() {
  const [highContrast, setHighContrast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedContrast = localStorage.getItem("highContrast");
    if (savedContrast === "true") {
      setHighContrast(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    
    localStorage.setItem("highContrast", highContrast.toString());
  }, [highContrast, mounted]);

  if (!mounted) return null;

  const handleClick = () => {
    setHighContrast(!highContrast);
  };

  return (
    <button 
      onClick={handleClick}
      className="flex items-center gap-1 rounded px-2 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900"
      title={highContrast ? "Normaler Kontrast" : "Hoher Kontrast"}
      aria-label={highContrast ? "Normaler Kontrast" : "Hoher Kontrast"}
    >
      {highContrast ? (
        <EyeOff className="h-3 w-3" />
      ) : (
        <Eye className="h-3 w-3" />
      )}
      <span className="hidden sm:inline">Kontrast</span>
    </button>
  );
} 