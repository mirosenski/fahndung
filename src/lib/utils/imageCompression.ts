/**
 * Client-seitige Bildkompression für Uploads
 * Reduziert Bildgröße vor dem Upload um 413-Fehler zu vermeiden
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Berechne neue Dimensionen
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Canvas-Größe setzen
      canvas.width = width;
      canvas.height = height;

      // Bild zeichnen
      ctx?.drawImage(img, 0, 0, width, height);

      // Als Blob konvertieren
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Neuen File erstellen
            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Bildkompression fehlgeschlagen'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'));
    
    // Bild laden
    const url = URL.createObjectURL(file);
    img.src = url;
  });
};

/**
 * Prüft ob eine Datei komprimiert werden sollte
 */
export const shouldCompressImage = (file: File): boolean => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  return imageTypes.includes(file.type) && file.size > maxSize;
};

/**
 * Schätzt die komprimierte Größe
 */
export const estimateCompressedSize = (file: File): number => {
  if (!shouldCompressImage(file)) return file.size;
  
  // Grobe Schätzung: 30-50% der ursprünglichen Größe
  return Math.round(file.size * 0.4);
}; 