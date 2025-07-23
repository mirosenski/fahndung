"use client";

import React, { useEffect, useState } from "react";
import { setupAllUsers } from "~/lib/auth";
import { CheckCircle } from "lucide-react";

export default function AutoSetup() {
  const [isSetup, setIsSetup] = useState(false);
  const [setupMessage, setSetupMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    const initializeUsers = async () => {
      // Prüfe, ob Setup bereits ausgeführt wurde
      if (hasRun) return;

      // Prüfe, ob wir auf der Login-Seite sind
      const isLoginPage = window.location.pathname === "/login";

      // Führe Setup nur auf der Login-Seite aus
      if (!isLoginPage) {
        setHasRun(true);
        return;
      }

      try {
        setIsLoading(true);
        console.log("🔧 Starte automatisches Benutzer-Setup...");
        const result = await setupAllUsers();

        if (result.success) {
          setIsSetup(true);
          setSetupMessage(result.message);
          console.log("✅ Automatisches Setup erfolgreich:", result.message);
        } else {
          console.warn("⚠️ Setup-Warnung:", result.message);
          setSetupMessage(result.message);
        }
      } catch (error) {
        console.error("❌ Fehler beim automatischen Setup:", error);
        setSetupMessage("Fehler beim automatischen Setup der Benutzer");
      } finally {
        setIsLoading(false);
        setHasRun(true);
      }
    };

    // Führe Setup nur einmal beim Start aus
    void initializeUsers();
  }, [hasRun]);

  // Zeige nur eine kurze Nachricht in der Konsole, nicht im UI
  if (isLoading) {
    return null; // Keine UI-Anzeige während des Setups
  }

  // Optional: Zeige eine kleine Erfolgsmeldung für 3 Sekunden
  if (isSetup && setupMessage) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <div className="flex items-center space-x-2 rounded-lg bg-green-600/90 p-3 text-white shadow-lg backdrop-blur-sm">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm">Benutzer-Setup erfolgreich</span>
        </div>
      </div>
    );
  }

  return null;
}
