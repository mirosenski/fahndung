// Shared logger utility to centralise logging across the application.
// Logs will only be emitted in non‑production environments. This helps
// prevent verbose console output in production builds and keeps
// performance overhead low.

// Determine if we are running in a development environment. Next.js
// replaces `process.env.NODE_ENV` at build time, so dead code
// elimination removes unreachable branches in production.
const isDev = process.env.NODE_ENV !== "production";

/**
 * Log a message to the console in development mode. In production this
 * function becomes a no‑op. Use this instead of `console.log` to
 * ensure that logs do not leak sensitive information in production.
 */
export function log(...args: unknown[]): void {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

/**
 * Warn about potential issues. This uses `console.warn` only in
 * development builds. Avoid spamming the console in production.
 */
export function warn(...args: unknown[]): void {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
}

/**
 * Output error messages. This helper ensures errors are logged during
 * development but suppressed in production. Consider also reporting
 * critical errors to monitoring services here.
 */
export function error(...args: unknown[]): void {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
}