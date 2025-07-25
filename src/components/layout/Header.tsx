"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  AlertTriangle,
  User,
  LogIn,
  Crown,
  Shield,
  FileText,
  Globe,
} from "lucide-react";
import { Logo } from "~/components/ui/Logo";
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

interface HeaderProps {
  variant?: "home" | "dashboard" | "login" | "register" | "admin";
  session?: Session | null;
  onLogout?: () => void;
  onCreateInvestigation?: () => void;
}

export default function Header({
  variant = "home",
  session,
  onLogout,
  onCreateInvestigation,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const renderHomeButtons = () => (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex cursor-pointer items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <User className="h-4 w-4" />
        <span>Dashboard</span>
      </button>
    </div>
  );

  const renderDashboardButtons = () => (
    <div className="flex items-center space-x-4">
      {/* User Info */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-900 dark:text-white">
          {session?.user?.email}
        </span>
        {session?.profile && (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              session.profile.role === "admin"
                ? "bg-red-500/20 text-red-600 dark:text-red-400"
                : session.profile.role === "editor"
                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                  : "bg-green-500/20 text-green-600 dark:text-green-400"
            }`}
          >
            {session.profile.role}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Dashboard Button anzeigen, wenn wir auf einer Fahndungen-Seite sind */}
        {pathname.startsWith("/fahndungen") && (
          <button
            onClick={() => router.push("/dashboard")}
            className="flex cursor-pointer items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <User className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
        )}

        {/* "Alle Fahndungen" Button nur anzeigen, wenn wir nicht bereits auf einer Fahndungen-Seite sind */}
        {!pathname.startsWith("/fahndungen") && (
          <button
            onClick={() => router.push("/fahndungen")}
            className="flex cursor-pointer items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            <FileText className="h-4 w-4" />
            <span>Alle Fahndungen</span>
          </button>
        )}

        {/* NEW: Artikel Button - nur anzeigen, wenn wir nicht bereits auf der Artikel-Seite sind */}
        {!pathname.startsWith("/artikel") && (
          <button
            onClick={() => router.push("/artikel")}
            className="flex cursor-pointer items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            <Globe className="h-4 w-4" />
            <span>Artikel</span>
          </button>
        )}

        {session?.profile?.role === "editor" && (
          <button
            onClick={onCreateInvestigation}
            className="flex cursor-pointer items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Neue Fahndung</span>
          </button>
        )}

        <button
          onClick={onLogout}
          className="flex cursor-pointer items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
        >
          <User className="h-4 w-4" />
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  );

  const renderLoginButtons = () => (
    <div className="flex items-center space-x-4">
      {/* Keine Buttons auf der Login-Seite */}
    </div>
  );

  const renderRegisterButtons = () => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => router.push("/login")}
        className="flex cursor-pointer items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <LogIn className="h-4 w-4" />
        <span>Anmelden</span>
      </button>
    </div>
  );

  const renderAdminButtons = () => (
    <div className="flex items-center space-x-4">
      {/* User Info */}
      <div className="flex items-center space-x-2">
        <Crown className="h-5 w-5 text-yellow-500" />
        <span className="text-sm text-gray-900 dark:text-white">
          {session?.user?.email}
        </span>
        <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400">
          Admin
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex cursor-pointer items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <Shield className="h-4 w-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={onLogout}
          className="flex cursor-pointer items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
        >
          <User className="h-4 w-4" />
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  );

  const getButtons = () => {
    switch (variant) {
      case "home":
        return renderHomeButtons();
      case "dashboard":
        return renderDashboardButtons();
      case "login":
        return renderLoginButtons();
      case "register":
        return renderRegisterButtons();
      case "admin":
        return renderAdminButtons();
      default:
        return renderHomeButtons();
    }
  };

  return (
    <>
      <header className="border-b border-gray-200 bg-white backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo className="text-foreground" showLink={true} />
            </div>
            <div className="flex items-center space-x-4">{getButtons()}</div>
          </div>
        </div>
      </header>
      <Breadcrumb />
    </>
  );
}
