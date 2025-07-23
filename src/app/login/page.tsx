"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  User,
  Shield,
  Crown,
  Database,
} from "lucide-react";
import { supabase } from "~/lib/supabase";
import { setupAllUsers, clearAuthSession } from "~/lib/auth";
import Header from "~/components/layout/Header";
import AutoSetup from "~/components/AutoSetup";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!supabase) {
        setError("Supabase ist nicht konfiguriert");
        return;
      }

      // Zuerst Session bereinigen
      console.log("🧹 Bereinige alte Session vor Login...");
      await clearAuthSession();

      console.log("🔐 Starte Login-Prozess...");
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login-Fehler:", error);
        if (error.message.includes("Invalid login credentials")) {
          setError(
            "Ungültige Anmeldedaten. Bitte überprüfen Sie E-Mail und Passwort.",
          );
        } else if (error.message.includes("Auth session missing")) {
          setError("Session-Fehler. Bitte versuchen Sie es erneut.");
        } else {
          setError(`Login-Fehler: ${error.message}`);
        }
      } else {
        console.log("✅ Login erfolgreich");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Unerwarteter Login-Fehler:", err);
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  // Demo-Login-Daten automatisch ausfüllen
  const fillDemoData = (role: "admin" | "editor" | "user") => {
    const demoData = {
      admin: { email: "admin@fahndung.local", password: "admin123" },
      editor: { email: "editor@fahndung.local", password: "editor123" },
      user: { email: "user@fahndung.local", password: "user123" },
    };

    setEmail(demoData[role].email);
    setPassword(demoData[role].password);
    setError("");
  };

  // Demo-Login mit automatischer Anmeldung
  const handleDemoLogin = async (role: "admin" | "editor" | "user") => {
    fillDemoData(role);

    // Kurze Verzögerung für bessere UX
    setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError("");

        try {
          if (!supabase) {
            setError("Supabase ist nicht konfiguriert");
            return;
          }

          const { error } = await supabase.auth.signInWithPassword({
            email:
              role === "admin"
                ? "admin@fahndung.local"
                : role === "editor"
                  ? "editor@fahndung.local"
                  : "user@fahndung.local",
            password:
              role === "admin"
                ? "admin123"
                : role === "editor"
                  ? "editor123"
                  : "user123",
          });

          if (error) {
            console.error("Login-Fehler:", error);
            if (error.message.includes("Invalid login credentials")) {
              setError(
                `Demo-User ${role} existiert nicht. Bitte erstelle zuerst die Demo-User mit dem "Demo-Benutzer erstellen" Button.`,
              );
            } else {
              setError(`Login-Fehler: ${error.message}`);
            }
          } else {
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Unerwarteter Fehler:", error);
          setError("Ein unerwarteter Fehler ist aufgetreten");
        } finally {
          setLoading(false);
        }
      })();
    }, 100);
  };

  // Alle Benutzer einrichten (Demo + PTLS Web)
  const handleSetupAllUsers = async () => {
    setSetupLoading(true);
    setError("");

    try {
      const result = await setupAllUsers();
      setError(result.message);
    } catch (error) {
      console.error("Setup-Fehler:", error);
      setError(
        "Fehler beim Erstellen der Benutzer. Bitte überprüfen Sie die Supabase-Konfiguration.",
      );
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AutoSetup />
      <Header variant="login" />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                Fahndung
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Anmelden oder Registrieren
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="flex items-center space-x-2 rounded-lg border border-red-500/30 bg-red-500/20 p-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              {/* Demo-Login-Buttons */}
              <div className="space-y-3">
                <p className="text-center text-sm text-gray-400">
                  Demo-Accounts zum Testen:
                </p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("admin")}
                    disabled={loading}
                    className="flex flex-1 items-center justify-center space-x-2 rounded-lg border border-red-500/30 bg-red-600/20 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-600/30 disabled:opacity-50"
                  >
                    <Crown className="h-4 w-4" />
                    <span>{loading ? "Anmelden..." : "Admin"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("editor")}
                    disabled={loading}
                    className="flex flex-1 items-center justify-center space-x-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-2 text-sm text-blue-400 transition-colors hover:bg-blue-600/30 disabled:opacity-50"
                  >
                    <Shield className="h-4 w-4" />
                    <span>{loading ? "Anmelden..." : "Editor"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("user")}
                    disabled={loading}
                    className="flex flex-1 items-center justify-center space-x-2 rounded-lg border border-green-500/30 bg-green-600/20 px-3 py-2 text-sm text-green-400 transition-colors hover:bg-green-600/30 disabled:opacity-50"
                  >
                    <User className="h-4 w-4" />
                    <span>{loading ? "Anmelden..." : "User"}</span>
                  </button>
                </div>

                {/* Setup All Users Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSetupAllUsers}
                    disabled={setupLoading}
                    className="mx-auto flex items-center justify-center space-x-2 rounded-lg border border-purple-500/30 bg-purple-600/20 px-4 py-2 text-sm text-purple-400 transition-colors hover:bg-purple-600/30 disabled:opacity-50"
                  >
                    <Database className="h-4 w-4" />
                    <span>
                      {setupLoading
                        ? "Erstelle alle Benutzer..."
                        : "Alle Benutzer einrichten"}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    E-Mail
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-dark-mode px-4 py-3"
                    placeholder="ihre@email.com"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-gray-400" />
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Passwort
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-dark-mode px-4 py-3 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-600/50"
                >
                  {loading ? "Anmelden..." : "Anmelden"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:bg-green-600/50"
                >
                  Registrieren
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Durch die Anmeldung stimmen Sie unseren{" "}
                <a
                  href="#"
                  className="text-blue-400 transition-colors hover:text-blue-300"
                >
                  Nutzungsbedingungen
                </a>{" "}
                zu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
