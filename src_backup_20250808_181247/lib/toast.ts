// Einfache Toast-Implementierung ohne externe Dependencies
export const toast = {
  success: (message: string) => {
    console.log("✅", message);
    // Einfache Browser-Notification als Fallback
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Erfolg", { body: message });
      }
    }
  },
  error: (message: string) => {
    console.error("❌", message);
    // Einfache Browser-Notification als Fallback
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Fehler", { body: message });
      }
    }
  },
  warning: (message: string) => {
    console.warn("⚠️", message);
  },
  info: (message: string) => {
    console.info("ℹ️", message);
  },
};
