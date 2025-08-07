import React, { useEffect, useState } from "react";
import { GlobalBackgroundLight } from "./GlobalBackgroundLight";
import { GlobalBackgroundDark } from "./GlobalBackgroundDark";

interface GlobalBackgroundProps {
  className?: string;
  showSphere?: boolean;
}

export const GlobalBackground: React.FC<GlobalBackgroundProps> = ({
  className = "",
  showSphere = true,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Prüfe ob das HTML-Element die 'dark' Klasse hat (Ihr Theme-System)
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
      console.log("Dark mode detected:", isDark);
    };

    // Initial prüfen
    checkDarkMode();

    // Observer für Änderungen am HTML-Element
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  console.log("Rendering with isDarkMode:", isDarkMode);

  return isDarkMode ? (
    <GlobalBackgroundDark className={className} showSphere={showSphere} />
  ) : (
    <GlobalBackgroundLight className={className} showSphere={showSphere} />
  );
};
