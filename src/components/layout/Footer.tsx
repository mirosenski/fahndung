"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileText,
  Shield,
  Crown,
  User,
  LogIn,
  UserPlus,
  Instagram,
  Facebook,
  MessageCircle,
  Twitter,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { Logo } from "~/components/ui/Logo";
import { useTheme } from "next-themes";
import { Button } from "~/components/ui/button";

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

interface FooterProps {
  variant?: "home" | "dashboard" | "login" | "register" | "admin";
  session?: Session | null;
}

export default function Footer({ variant = "home" }: FooterProps) {
  // Automatisch generierte Menüpunkte basierend auf Header-Varianten
  const getMenuItems = () => {
    switch (variant) {
      case "home":
        return [{ href: "/dashboard", label: "Dashboard", icon: User }];

      case "dashboard":
        return [
          { href: "/dashboard", label: "Dashboard", icon: User },
          { href: "/fahndungen", label: "Alle Fahndungen", icon: FileText },

        ];

      case "login":
        return [
          { href: "/login", label: "Anmelden", icon: LogIn },
          { href: "/register", label: "Registrierung", icon: UserPlus },
        ];

      case "register":
        return [{ href: "/login", label: "Anmelden", icon: LogIn }];

      case "admin":
        return [
          { href: "/dashboard", label: "Dashboard", icon: Shield },
          { href: "/admin", label: "Administration", icon: Crown },
        ];

      default:
        return [];
    }
  };

  // Soziale Netzwerke
  const socialItems = [
    { href: "https://instagram.com", label: "Instagram", icon: Instagram },
    { href: "https://facebook.com", label: "Facebook", icon: Facebook },
    { href: "https://whatsapp.com", label: "WhatsApp", icon: MessageCircle },
    { href: "https://x.com", label: "X (Twitter)", icon: Twitter },
  ];

  // Rechtliche Links
  const legalItems = [
    { href: "/impressum", label: "Impressum" },
    { href: "/datenschutz", label: "Datenschutz" },
    { href: "/kontakt", label: "Kontakt" },
  ];

  const menuItems = getMenuItems();

  // Mode Toggle
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration-Problem vermeiden
  useEffect(() => {
    setMounted(true);
  }, []);

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="h-5 w-5" />;
    if (theme === "system") {
      return <Monitor className="h-5 w-5" />;
    }
    return resolvedTheme === "dark" ? (
      <Sun className="h-5 w-5" />
    ) : (
      <Moon className="h-5 w-5" />
    );
  };

  const getThemeLabel = () => {
    if (!mounted) return "System";
    switch (theme) {
      case "light":
        return "Hell";
      case "dark":
        return "Dunkel";
      case "system":
        return "System";
      default:
        return "Theme";
    }
  };

  // Aktuelles Jahr für Copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="md:flex md:justify-between">
          {/* Logo und Beschreibung - Links */}
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <Logo className="text-foreground" showLink={false} />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              Landeskriminalamt Baden-Württemberg - Zentrale Dienststelle für
              polizeiliche Kriminalitätsbekämpfung und Fahndung.
            </p>
          </div>

          {/* Navigation - Rechts */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 sm:gap-6">
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-gray-900 dark:text-white">
                Navigation
              </h2>
              <ul className="font-medium text-gray-500 dark:text-gray-400">
                {menuItems.map((item) => (
                  <li key={item.href} className="mb-4">
                    <Link href={item.href} className="hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
                {/* Barrierefreiheit unter Navigation */}
                <li className="mb-4">
                  <Link href="/leichte-sprache" className="hover:underline">
                    Leichte Sprache
                  </Link>
                </li>
                <li className="mb-4">
                  <Link href="/gebaerdensprache" className="hover:underline">
                    Gebärdensprache
                  </Link>
                </li>
              </ul>
            </div>

            {/* Rechtliche Links */}
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-gray-900 dark:text-white">
                Rechtliches
              </h2>
              <ul className="font-medium text-gray-500 dark:text-gray-400">
                {legalItems.map((item) => (
                  <li key={item.href} className="mb-4">
                    <Link href={item.href} className="hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Trennlinie */}
        <hr className="my-6 border-gray-200 dark:border-gray-700 sm:mx-auto lg:my-8" />

        {/* Copyright, Theme Toggle und Social Media */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400 sm:text-center">
            © {currentYear}{" "}
            <Link href="/" className="hover:underline">
              Landeskriminalamt Baden-Württemberg
            </Link>
            . Alle Rechte vorbehalten.
          </span>

          {/* Soziale Netzwerke */}
          <div className="mt-4 flex items-center space-x-5 sm:mt-0 sm:justify-center rtl:space-x-reverse">
            {/* Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                aria-label="Theme umschalten"
                onClick={() => {
                  if (!mounted) return;
                  if (theme === "light") setTheme("dark");
                  else if (theme === "dark") setTheme("system");
                  else setTheme("light");
                }}
              >
                {getThemeIcon()}
                <span className="ml-2">{getThemeLabel()}</span>
              </Button>
            </div>
            {/* Soziale Netzwerke */}
            {socialItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
