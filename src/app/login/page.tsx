"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { supabase } from "~/lib/supabase";
import { clearAuthSession } from "~/lib/auth";
import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";
import AutoSetup from "~/components/AutoSetup";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
      <Footer variant="login" />
    </div>
  );
}
