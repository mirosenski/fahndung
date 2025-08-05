"use client";

import { Breadcrumb } from "~/components/ui/Breadcrumb";
import AdaptiveHeaderOptimized from "./AdaptiveHeaderOptimized";
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
  return (
    <>
      <AdaptiveHeaderOptimized variant={variant} session={session} onLogout={onLogout} />
      <Breadcrumb />
    </>
  );
}
