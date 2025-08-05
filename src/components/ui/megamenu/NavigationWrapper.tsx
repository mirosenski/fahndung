"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import type { MenuItem } from "./types";

// Dynamisch laden für bessere Performance
const MobileMegaMenu = dynamic(
  () =>
    import("./MobileMegaMenu").then((mod) => ({ default: mod.MobileMegaMenu })),
  {
    ssr: false,
    loading: () => (
      <div className="p-2 md:hidden">
        <div className="h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    ),
  },
);

const DesktopMegaMenu = dynamic(
  () =>
    import("./DesktopMegaMenu").then((mod) => ({
      default: mod.DesktopMegaMenu,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="hidden md:block">
        <div className="h-16 animate-pulse bg-gray-200 dark:bg-gray-700" />
      </div>
    ),
  },
);

interface NavigationWrapperProps {
  menuItems?: MenuItem[];
  logo?: React.ReactNode;
}

export default function NavigationWrapper({
  menuItems,
  logo,
}: NavigationWrapperProps) {
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
    return <div className="h-16 animate-pulse bg-gray-200 dark:bg-gray-700" />;
  }

  return (
    <>
      {isMobile && <MobileMegaMenu menuItems={menuItems} />}
      <div className="hidden md:block">
        <DesktopMegaMenu menuItems={menuItems} logo={logo} />
      </div>
    </>
  );
}
