"use client";

import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Breadcrumb } from "~/components/ui/Breadcrumb";

interface Session {
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    user_id: string;
    email: string;
    name?: string;
    role: "admin" | "editor" | "user";
    department?: string;
    phone?: string;
    last_login?: string;
    login_count?: number;
    is_active?: boolean;
    created_by?: string;
    notes?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
  } | null;
}

interface PageLayoutProps {
  children: ReactNode;
  variant?: "home" | "dashboard" | "login" | "register" | "admin";
  session?: Session | null;
  onLogout?: () => void;
  onCreateInvestigation?: () => void;
  showHeader?: boolean;
  showBreadcrumb?: boolean;
  showHero?: boolean;
  showFooter?: boolean;
}

export default function PageLayout({
  children,
  variant = "home",
  session,
  onLogout,
  onCreateInvestigation,
  showHeader = true,
  showBreadcrumb = false,
  showHero = false,
  showFooter = false,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      {showHeader && (
        <Header
          variant={variant}
          session={session}
          onLogout={onLogout}
          onCreateInvestigation={onCreateInvestigation}
        />
      )}

      {/* Breadcrumb */}
      {showBreadcrumb && <Breadcrumb />}

      {/* Hero Section (für zukünftige Verwendung) */}
      {showHero && (
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center text-white">
              <h1 className="mb-4 text-4xl font-bold">Hero Section</h1>
              <p className="text-xl opacity-90">Zukünftige Hero-Komponente</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      {showFooter && <Footer variant={variant} session={session} />}
    </div>
  );
}
