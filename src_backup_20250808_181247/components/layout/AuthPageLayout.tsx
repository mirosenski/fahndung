"use client";

import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface AuthPageLayoutProps {
  children: ReactNode;
  variant: "login" | "register";
  className?: string;
}

export default function AuthPageLayout({
  children,
  variant,
  className = "",
}: AuthPageLayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <Header variant={variant} />
      <main className="flex-1">{children}</main>
      <Footer variant={variant} />
    </div>
  );
}
