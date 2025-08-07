/**
 * Debug-Utilities für kontrollierte Console-Logs
 * Alle Debug-Logs werden nur in Development-Modus angezeigt
 */

const isDevelopment = process.env.NODE_ENV === "development";

export const debug = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  // Spezielle Debug-Funktionen für häufige Anwendungsfälle
  api: {
    request: (path: string, input: unknown) => {
      if (isDevelopment) {
        console.log(`🔍 API Request: ${path}`, {
          input,
          timestamp: new Date().toISOString(),
        });
      }
    },
    
    response: (path: string, data: unknown) => {
      if (isDevelopment) {
        console.log(`✅ API Response: ${path}`, {
          data,
          timestamp: new Date().toISOString(),
        });
      }
    },
    
    error: (path: string, error: unknown, input?: unknown) => {
      if (isDevelopment) {
        console.error(`❌ API Error: ${path}`, {
          error,
          input,
          timestamp: new Date().toISOString(),
        });
      }
    },
  },
  
  component: {
    render: (componentName: string, props?: unknown) => {
      if (isDevelopment) {
        console.log(`🎨 Component Render: ${componentName}`, {
          props,
          timestamp: new Date().toISOString(),
        });
      }
    },
    
    update: (componentName: string, changes: unknown) => {
      if (isDevelopment) {
        console.log(`🔄 Component Update: ${componentName}`, {
          changes,
          timestamp: new Date().toISOString(),
        });
      }
    },
  },
  
  hook: {
    init: (hookName: string, params?: unknown) => {
      if (isDevelopment) {
        console.log(`🔧 Hook Init: ${hookName}`, {
          params,
          timestamp: new Date().toISOString(),
        });
      }
    },
    
    effect: (hookName: string, effect: string, deps?: unknown) => {
      if (isDevelopment) {
        console.log(`⚡ Hook Effect: ${hookName} - ${effect}`, {
          deps,
          timestamp: new Date().toISOString(),
        });
      }
    },
  },
  
  realtime: {
    connect: (channel: string) => {
      if (isDevelopment) {
        console.log(`🔗 Real-time Connect: ${channel}`, {
          timestamp: new Date().toISOString(),
        });
      }
    },
    
    event: (channel: string, event: string, payload?: unknown) => {
      if (isDevelopment) {
        console.log(`📡 Real-time Event: ${channel} - ${event}`, {
          payload,
          timestamp: new Date().toISOString(),
        });
      }
    },
    
    disconnect: (channel: string) => {
      if (isDevelopment) {
        console.log(`🔌 Real-time Disconnect: ${channel}`, {
          timestamp: new Date().toISOString(),
        });
      }
    },
  },
};
