"use client";

import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  User,
  LogIn,
  UserPlus,
  Crown,
  Shield,
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
  onShowTestPanel?: () => void;
}

export default function Header({
  variant = "home",
  session,
  onLogout,
  onCreateInvestigation,
  onShowTestPanel,
}: HeaderProps) {
  const router = useRouter();

  // Logo-Komponente hat bereits einen Link, daher brauchen wir keinen separaten Click-Handler

  const renderHomeButtons = () => (
    <div className="flex items-center space-x-4">
      <button
        onClick={onShowTestPanel}
        className="flex cursor-pointer items-center space-x-2 rounded-lg bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700"
      >
        <AlertTriangle className="h-4 w-4" />
        <span>Test-Panel</span>
      </button>
      <button
        onClick={() => router.push("/dashboard")}
        className="flex cursor-pointer items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
      >
        <User className="h-4 w-4" />
        <span>Dashboard</span>
      </button>
    </div>
  );

  const renderDashboardButtons = () => (
    <div className="flex items-center space-x-4">
      {/* User Info */}
      <div className="flex items-center space-x-2 text-white">
        <User className="h-5 w-5" />
        <span className="text-sm">{session?.user?.email}</span>
        {session?.profile && (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              session.profile.role === "admin"
                ? "bg-red-500/20 text-red-400"
                : session.profile.role === "editor"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-green-500/20 text-green-400"
            }`}
          >
            {session.profile.role}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {session?.profile?.role === "editor" && (
          <button
            onClick={onCreateInvestigation}
            className="flex cursor-pointer items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Neue Fahndung</span>
          </button>
        )}

        <button
          onClick={onLogout}
          className="flex cursor-pointer items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
        >
          <User className="h-4 w-4" />
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  );

  const renderLoginButtons = () => (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => router.push("/register")}
        className="flex cursor-pointer items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
      >
        <UserPlus className="h-4 w-4" />
        <span>Registrieren</span>
      </button>
      <button
        onClick={() => router.push("/")}
        className="flex cursor-pointer items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
      >
        <AlertTriangle className="h-4 w-4" />
        <span>Home</span>
      </button>
    </div>
  );

  const renderRegisterButtons = () => (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => router.push("/login")}
        className="flex cursor-pointer items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
      >
        <LogIn className="h-4 w-4" />
        <span>Anmelden</span>
      </button>
      <button
        onClick={() => router.push("/")}
        className="flex cursor-pointer items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
      >
        <AlertTriangle className="h-4 w-4" />
        <span>Home</span>
      </button>
    </div>
  );

  const renderAdminButtons = () => (
    <div className="flex items-center space-x-4">
      {/* User Info */}
      <div className="flex items-center space-x-2 text-white">
        <Crown className="h-5 w-5 text-yellow-500" />
        <span className="text-sm">{session?.user?.email}</span>
        <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
          Admin
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex cursor-pointer items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Shield className="h-4 w-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={onLogout}
          className="flex cursor-pointer items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
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
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo className="text-white" showLink={true} />
            </div>
            {getButtons()}
          </div>
        </div>
      </header>
      <Breadcrumb />
    </>
  );
}
