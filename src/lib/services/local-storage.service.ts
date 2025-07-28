import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface LocalImageMetadata {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  uploadedAt: Date;
  tags?: string[];
  description?: string;
  isPublic: boolean;
}

export interface LocalImageUploadOptions {
  file: Buffer;
  originalName: string;
  mimeType: string;
  directory?: string;
  tags?: string[];
  description?: string;
  isPublic?: boolean;
}

export class LocalStorageService {
  private readonly basePath: string;
  private readonly metadataPath: string;

  constructor() {
    this.basePath = path.join(process.cwd(), "public", "images");
    this.metadataPath = path.join(this.basePath, ".metadata.json");
    this.ensureDirectories();
  }

  /**
   * Erstellt notwendige Verzeichnisse
   */
  private ensureDirectories(): void {
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

  /**
   * Lädt die Metadaten-Datei
   */
  private loadMetadata(): LocalImageMetadata[] {
    try {
      if (fs.existsSync(this.metadataPath)) {
        const data = fs.readFileSync(this.metadataPath, "utf-8");
        const parsed = JSON.parse(data) as LocalImageMetadata[];
        return parsed;
      }
    } catch (error) {
      console.error("Fehler beim Laden der Metadaten:", error);
    }
    return [];
  }

  /**
   * Speichert die Metadaten-Datei
   */
  private saveMetadata(metadata: LocalImageMetadata[]): void {
    try {
      fs.writeFileSync(this.metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error("Fehler beim Speichern der Metadaten:", error);
    }
  }

  /**
   * Generiert eine eindeutige ID
   */
  private generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Generiert einen sicheren Dateinamen
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(4).toString("hex");
    const extension = path.extname(originalName);
    return `${timestamp}_${randomString}${extension}`;
  }

  /**
   * Lädt ein Bild lokal hoch
   */
  async uploadImage(
    options: LocalImageUploadOptions,
  ): Promise<LocalImageMetadata> {
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

    // Erstelle Verzeichnis falls nötig
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Speichere Datei
    try {
      fs.writeFileSync(fullPath, file);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Fehler beim Speichern der Datei: ${errorMessage}`);
    }

    // Erstelle Metadaten
    const metadata: LocalImageMetadata = {
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

    // Speichere Metadaten
    const allMetadata = this.loadMetadata();
    allMetadata.push(metadata);
    this.saveMetadata(allMetadata);

    return metadata;
  }

  /**
   * Holt alle lokalen Bilder
   */
  async getAllImages(): Promise<LocalImageMetadata[]> {
    return this.loadMetadata();
  }

  /**
   * Holt ein spezifisches Bild
   */
  async getImage(id: string): Promise<LocalImageMetadata | null> {
    const metadata = this.loadMetadata();
    return metadata.find((img) => img.id === id) ?? null;
  }

  /**
   * Holt das Bild als Buffer
   */
  async getImageBuffer(id: string): Promise<Buffer | null> {
    const image = await this.getImage(id);
    if (!image) return null;

    const fullPath = path.join(this.basePath, image.filePath);

    try {
      return fs.readFileSync(fullPath);
    } catch (error) {
      console.error("Fehler beim Lesen der Datei:", error);
      return null;
    }
  }

  /**
   * Löscht ein Bild
   */
  async deleteImage(id: string): Promise<boolean> {
    const metadata = this.loadMetadata();
    const imageIndex = metadata.findIndex((img) => img.id === id);

    if (imageIndex === -1) return false;

    const image = metadata[imageIndex];
    if (!image) return false;

    const fullPath = path.join(this.basePath, image.filePath);

    try {
      // Lösche Datei
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }

      // Entferne aus Metadaten
      metadata.splice(imageIndex, 1);
      this.saveMetadata(metadata);

      return true;
    } catch (error) {
      console.error("Fehler beim Löschen der Datei:", error);
      return false;
    }
  }

  /**
   * Aktualisiert Bild-Metadaten
   */
  async updateImageMetadata(
    id: string,
    updates: Partial<
      Pick<LocalImageMetadata, "tags" | "description" | "isPublic">
    >,
  ): Promise<LocalImageMetadata | null> {
    const metadata = this.loadMetadata();
    const imageIndex = metadata.findIndex((img) => img.id === id);

    if (imageIndex === -1) return null;

    const existingImage = metadata[imageIndex];
    if (!existingImage) return null;

    const updatedImage: LocalImageMetadata = {
      ...existingImage,
      ...updates,
    };

    metadata[imageIndex] = updatedImage;
    this.saveMetadata(metadata);
    return updatedImage;
  }

  /**
   * Sucht Bilder nach Tags oder Beschreibung
   */
  async searchImages(query: string): Promise<LocalImageMetadata[]> {
    const metadata = this.loadMetadata();
    const searchTerm = query.toLowerCase();

    return metadata.filter(
      (img) =>
        img.originalName.toLowerCase().includes(searchTerm) ||
        (img.description?.toLowerCase().includes(searchTerm) ?? false) ||
        (img.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)) ??
          false),
    );
  }

  /**
   * Holt die URL für ein lokales Bild
   */
  getImageUrl(filePath: string): string {
    return `/images/${filePath}`;
  }

  /**
   * Prüft ob eine Datei existiert
   */
  async imageExists(id: string): Promise<boolean> {
    const image = await this.getImage(id);
    if (!image) return false;

    const fullPath = path.join(this.basePath, image.filePath);
    return fs.existsSync(fullPath);
  }

  /**
   * Holt Statistiken über lokale Bilder
   */
  async getStats(): Promise<{
    totalImages: number;
    totalSize: number;
    byType: Record<string, number>;
  }> {
    const metadata = this.loadMetadata();
    const stats = {
      totalImages: metadata.length,
      totalSize: metadata.reduce((sum, img) => sum + img.fileSize, 0),
      byType: {} as Record<string, number>,
    };

    // Gruppiere nach MIME-Type
    for (const img of metadata) {
      const type = img.mimeType.split("/")[0];
      if (type) {
        stats.byType[type] = (stats.byType[type] ?? 0) + 1;
      }
    }

    return stats;
  }
}
