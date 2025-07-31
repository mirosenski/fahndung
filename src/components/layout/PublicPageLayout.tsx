"use client";

import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface PublicPageLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function PublicPageLayout({
  children,
  className = "",
}: PublicPageLayoutProps) {
  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 ${className}`}>
      <Header variant="home" />
      <main className="flex-1">{children}</main>
      <Footer variant="home" />
    </div>
  );
}
