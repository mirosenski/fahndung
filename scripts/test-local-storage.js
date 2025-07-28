const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class LocalStorageService {
  constructor() {
    this.basePath = path.join(process.cwd(), "public", "images");
    this.metadataPath = path.join(this.basePath, ".metadata.json");
    this.ensureDirectories();
  }

  ensureDirectories() {
    const directories = [
      this.basePath,
      path.join(this.basePath, "uploads"),
      path.join(this.basePath, "thumbnails"),
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  generateId() {
    return crypto.randomUUID();
  }

  generateFileName(originalName) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(4).toString("hex");
    const extension = path.extname(originalName);
    return `${timestamp}_${randomString}${extension}`;
  }

  async uploadImage(options) {
    const {
      file,
      originalName,
      mimeType,
      directory = "uploads",
      tags = [],
      description,
      isPublic = true,
    } = options;

    // Generiere eindeutige ID und Dateinamen
    const id = this.generateId();
    const fileName = this.generateFileName(originalName);
    const filePath = path.join(directory, fileName);
    const fullPath = path.join(this.basePath, filePath);

    console.log("📁 Test Upload Details:");
    console.log("- ID:", id);
    console.log("- Original Name:", originalName);
    console.log("- File Name:", fileName);
    console.log("- File Path:", filePath);
    console.log("- Full Path:", fullPath);
    console.log("- File Size:", file.length, "bytes");

    // Erstelle Verzeichnis falls nötig
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      console.log("📁 Erstelle Verzeichnis:", dirPath);
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Speichere Datei
    try {
      console.log("💾 Speichere Datei...");
      fs.writeFileSync(fullPath, file);
      console.log("✅ Datei erfolgreich gespeichert");
    } catch (error) {
      console.error("❌ Fehler beim Speichern der Datei:", error);
      throw new Error(`Fehler beim Speichern der Datei: ${error.message}`);
    }

    // Erstelle Metadaten
    const metadata = {
      id,
      originalName,
      fileName,
      filePath,
      fileSize: file.length,
      mimeType,
      uploadedAt: new Date(),
      tags,
      description,
      isPublic,
    };

    console.log("📋 Metadaten erstellt:", metadata);

    // Speichere Metadaten
    const allMetadata = this.loadMetadata();
    allMetadata.push(metadata);
    this.saveMetadata(allMetadata);

    console.log("✅ Metadaten gespeichert");

    return metadata;
  }

  loadMetadata() {
    try {
      if (fs.existsSync(this.metadataPath)) {
        const data = fs.readFileSync(this.metadataPath, "utf-8");
        const parsed = JSON.parse(data);
        return parsed;
      }
    } catch (error) {
      console.error("Fehler beim Laden der Metadaten:", error);
    }
    return [];
  }

  saveMetadata(metadata) {
    try {
      fs.writeFileSync(this.metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error("Fehler beim Speichern der Metadaten:", error);
    }
  }
}

// Test-Funktion
async function testLocalStorage() {
  console.log("🧪 Teste LocalStorageService...");

  const service = new LocalStorageService();

  // Erstelle eine Test-Datei
  const testBuffer = Buffer.from("Test-Bild-Daten", "utf-8");

  try {
    const result = await service.uploadImage({
      file: testBuffer,
      originalName: "test-image.txt",
      mimeType: "text/plain",
      directory: "uploads",
      tags: ["test"],
      description: "Test-Bild für LocalStorageService",
      isPublic: true,
    });

    console.log("✅ Test erfolgreich!");
    console.log("📊 Ergebnis:", result);

    // Prüfe ob Datei existiert
    const fullPath = path.join(service.basePath, result.filePath);
    if (fs.existsSync(fullPath)) {
      console.log("✅ Datei existiert:", fullPath);
    } else {
      console.log("❌ Datei existiert nicht:", fullPath);
    }
  } catch (error) {
    console.error("❌ Test fehlgeschlagen:", error);
  }
}

// Führe Test aus
testLocalStorage();
