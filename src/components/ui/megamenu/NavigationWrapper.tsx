"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";

// Dynamisch laden für bessere Performance
const DesktopMegaMenu = dynamic(
  () =>
    import("./DesktopMegaMenu").then((mod) => ({
      default: mod.DesktopMegaMenu,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="hidden md:block">
        <div className="h-16 animate-pulse bg-muted dark:bg-muted" />
      </div>
    ),
  },
);

interface NavigationWrapperProps {
  logo?: React.ReactNode;
}

export default function NavigationWrapper({ logo }: NavigationWrapperProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Optimierte Device-Erkennung mit Debouncing
  const checkDevice = useCallback(() => {
    const newIsMobile = window.innerWidth < 768;
    if (newIsMobile !== isMobile) {
      setIsMobile(newIsMobile);
    }
  }, [isMobile]);

  useEffect(() => {
    // Hydration-Status setzen
    setIsHydrated(true);

    // Initiale Prüfung
    checkDevice();

    // Event Listener mit Debouncing
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkDevice, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [checkDevice]);

  // Verhindere Hydration-Mismatch
  if (!isHydrated) {
    return <div className="h-16 animate-pulse bg-muted dark:bg-muted" />;
  }

  return (
    <>
      <div className="hidden md:block">
        <DesktopMegaMenu logo={logo} />
      </div>
    </>
  );
}
