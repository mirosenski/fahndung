module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      startServerCommand: "", // leer, weil Server schon läuft
      url: ["http://localhost:3010/"],
      settings: {
        preset: "desktop",
        chromeFlags: "--no-sandbox --disable-dev-shm-usage",
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lhci",
    },
  },
};
