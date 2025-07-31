"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  User,
  LogIn,
  Crown,
  Shield,
  FileText,
  Plus,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Logo } from "~/components/ui/Logo";
import { Breadcrumb } from "~/components/ui/Breadcrumb";
import { type Session } from "~/lib/auth";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "~/hooks/useAuth";

interface HeaderProps {
  variant?: "home" | "dashboard" | "login" | "register" | "admin";
  session?: Session | null;
  onLogout?: () => void;
}

export default function Header({
  variant = "home",
  session: externalSession,
  onLogout,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const { session: authSession, logout } = useAuth();

  // Verwende externe Session oder Session aus useAuth
  const session = externalSession ?? authSession;

  const handleLogin = () => {
    // Speichere die aktuelle Seite für Redirect nach Login
    if (typeof window !== "undefined") {
      sessionStorage.setItem("redirectAfterLogin", pathname ?? "/");
    }
    router.push("/login");
  };

  const handleLogout = async () => {
    setIsAvatarMenuOpen(false);
    // Verwende die logout Funktion aus useAuth, falls onLogout nicht verfügbar ist
    if (onLogout) {
      onLogout();
    } else {
      await logout();
    }
  };

  // Click outside handler für Avatar-Menü
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target as Node)
      ) {
        setIsAvatarMenuOpen(false);
      }
    };

    if (isAvatarMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAvatarMenuOpen]);

  const renderHomeButtons = () => (
    <div className="flex items-center space-x-8">
      {/* +Fahndung Link - nur anzeigen wenn nicht auf Wizard-Seiten und User ist Admin/Super_Admin */}
      {(session?.profile?.role === "admin" ||
        session?.profile?.role === "super_admin") &&
        !pathname?.startsWith("/fahndungen/neu") && (
          <span
            onClick={() => router.push("/fahndungen/neu/enhanced")}
            className="flex cursor-pointer items-center space-x-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Fahndung</span>
          </span>
        )}

      {/* Login/Avatar */}
      {session ? (
        <div className="relative" ref={avatarMenuRef}>
          <button
            onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
            className="flex items-center space-x-2 rounded-full bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
              <User className="h-4 w-4" />
            </div>
            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {isAvatarMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                {session.user?.email}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsAvatarMenuOpen(false);
                    router.push("/dashboard");
                  }}
                  className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Shield className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Abmelden</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <span
          onClick={handleLogin}
          className="flex cursor-pointer items-center space-x-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <LogIn className="h-4 w-4" />
          <span>Login</span>
        </span>
      )}
    </div>
  );

  const renderDashboardButtons = () => (
    <div className="flex items-center space-x-8">
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

      {/* Action Links */}
      <div className="flex items-center space-x-8">
        {/* +Fahndung Link - nur anzeigen wenn nicht auf Wizard-Seiten und User ist Admin/Super_Admin */}
        {(session?.profile?.role === "admin" ||
          session?.profile?.role === "super_admin") &&
          !pathname?.startsWith("/fahndungen/neu") && (
            <span
              onClick={() => router.push("/fahndungen/neu/enhanced")}
              className="flex cursor-pointer items-center space-x-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Fahndung</span>
            </span>
          )}

        {/* Dashboard Link anzeigen, wenn wir auf einer Fahndungen-Seite sind */}
        {pathname?.startsWith("/fahndungen") && (
          <span
            onClick={() => router.push("/dashboard")}
            className="flex cursor-pointer items-center space-x-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <User className="h-4 w-4" />
            <span>Dashboard</span>
          </span>
        )}

        {/* "Alle Fahndungen" Link nur anzeigen, wenn wir nicht bereits auf einer Fahndungen-Seite sind */}
        {!pathname?.startsWith("/fahndungen") && (
          <span
            onClick={() => router.push("/fahndungen")}
            className="flex cursor-pointer items-center space-x-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <FileText className="h-4 w-4" />
            <span>Alle</span>
          </span>
        )}

        <span
          onClick={onLogout}
          className="flex cursor-pointer items-center space-x-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          <span>Abmelden</span>
        </span>
      </div>
    </div>
  );

  const renderLoginButtons = () => (
    <div className="flex items-center space-x-4">
      {/* Keine Links auf der Login-Seite */}
    </div>
  );

  const renderRegisterButtons = () => (
    <div className="flex items-center space-x-8">
      <span
        onClick={() => router.push("/login")}
        className="flex cursor-pointer items-center space-x-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
      >
        <LogIn className="h-4 w-4" />
        <span>Anmelden</span>
      </span>
    </div>
  );

  const renderAdminButtons = () => (
    <div className="flex items-center space-x-8">
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

      {/* Action Links */}
      <div className="flex items-center space-x-8">
        {/* +Fahndung Link - nur anzeigen wenn nicht auf Wizard-Seiten */}
        {!pathname?.startsWith("/fahndungen/neu") && (
          <span
            onClick={() => router.push("/fahndungen/neu/enhanced")}
            className="flex cursor-pointer items-center space-x-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Fahndung</span>
          </span>
        )}

        <span
          onClick={() => router.push("/dashboard")}
          className="flex cursor-pointer items-center space-x-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <Shield className="h-4 w-4" />
          <span>Dashboard</span>
        </span>

        <span
          onClick={onLogout}
          className="flex cursor-pointer items-center space-x-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          <span>Abmelden</span>
        </span>
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
