"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
const Breadcrumb = dynamic(
  () => import("~/components/ui/Breadcrumb").then((m) => m.Breadcrumb),
  { ssr: false },
);
import AdaptiveHeaderOptimized from "./archive/AdaptiveHeaderOptimized";
import ModernHeader from "./ModernHeader";
import { type Session } from "~/lib/auth";

interface HeaderProps {
  variant?: "home" | "dashboard" | "login" | "register" | "admin";
  session?: Session | null;
  onLogout?: () => void;
}

export default function Header({
  variant = "home",
  session,
  onLogout,
}: HeaderProps) {
  const [headerVariant, setHeaderVariant] = useState<"modern" | "classic">(
    "modern",
  );

  useEffect(() => {
    const handleHeaderChange = (e: Event) => {
      const custom = e as CustomEvent<"modern" | "classic">;
      setHeaderVariant(custom.detail);
    };
    window.addEventListener(
      "header-variant-change",
      handleHeaderChange as EventListener,
    );

    const saved =
      (typeof window !== "undefined" &&
        localStorage.getItem("header-variant")) ||
      "modern";
    setHeaderVariant(saved as "modern" | "classic");

    return () =>
      window.removeEventListener(
        "header-variant-change",
        handleHeaderChange as EventListener,
      );
  }, []);

  const headerNode = useMemo(() => {
    return headerVariant === "modern" ? (
      <ModernHeader />
    ) : (
      <AdaptiveHeaderOptimized
        variant={variant}
        session={session}
        onLogout={onLogout}
      />
    );
  }, [headerVariant, variant, session, onLogout]);

  return (
    <>
      {headerNode}
      <Breadcrumb />
    </>
  );
}
