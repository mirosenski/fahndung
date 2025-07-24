import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface UploadResult {
  path: string;
  url: string;
  error?: string;
}

export const useSupabaseUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File, bucketName = 'media'): Promise<UploadResult> => {
    setIsUploading(true);
    setProgress(0);

    try {
      console.log('🔍 Supabase Upload: Prüfe Authentifizierung...');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Supabase Upload: Session-Fehler:', sessionError);
        throw new Error('Session-Fehler: ' + sessionError.message);
      }

      if (!session) {
        console.error('❌ Supabase Upload: Nicht authentifiziert');
        throw new Error('Nicht authentifiziert - Bitte melden Sie sich an');
      }

      console.log('✅ Supabase Upload: Authentifiziert für User:', session.user.email);

      // Generiere eindeutigen Dateinamen
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
      
      console.log('📁 Supabase Upload: Lade Datei hoch:', {
        originalName: file.name,
        newName: fileName,
        size: file.size,
        type: file.type
      });

      // Simuliere Progress für bessere UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 20, 90));
      }, 200);

      // Direkt zu Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        console.error('❌ Supabase Upload: Upload-Fehler:', error);
        throw new Error('Upload-Fehler: ' + error.message);
      }

      if (!data?.path) {
        throw new Error('Keine Pfad-Informationen vom Upload erhalten');
      }

      // Generiere öffentliche URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      const result: UploadResult = {
        path: data.path,
        url: urlData.publicUrl
      };

      console.log('✅ Supabase Upload: Erfolgreich hochgeladen:', {
        path: result.path,
        url: result.url
      });

      return result;

    } catch (error) {
      console.error('❌ Supabase Upload: Fehler:', error);
      return {
        path: '',
        url: '',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const deleteFile = async (filePath: string, bucketName = 'media'): Promise<boolean> => {
    try {
      console.log('🗑️ Supabase Upload: Lösche Datei:', filePath);
      
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('❌ Supabase Upload: Lösch-Fehler:', error);
        return false;
      }

      console.log('✅ Supabase Upload: Datei erfolgreich gelöscht');
      return true;
    } catch (error) {
      console.error('❌ Supabase Upload: Lösch-Fehler:', error);
      return false;
    }
  };

  return { 
    uploadFile, 
    deleteFile, 
    isUploading, 
    progress 
  };
}; 