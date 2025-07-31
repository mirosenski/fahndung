"use client";

import { useEffect } from "react";
import {
  setupGlobalErrorHandlers,
  cleanupGlobalErrorHandlers,
} from "~/lib/error-handlers";

export function GlobalErrorHandler() {
  useEffect(() => {
    setupGlobalErrorHandlers();

    return () => {
      cleanupGlobalErrorHandlers();
    };
  }, []);

  return null;
}
