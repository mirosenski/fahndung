// Einfache Environment-Variablen-Export-Datei
// Da das Projekt hauptsächlich process.env direkt verwendet

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
};
