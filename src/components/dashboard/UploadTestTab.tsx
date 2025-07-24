"use client";

import { useState } from 'react';
import { useSupabaseUpload } from '~/hooks/useSupabaseUpload';
import { DebugAuth } from '../DebugAuth';

interface UploadResult {
  path: string;
  url: string;
  error?: string;
}

export const UploadTestTab = () => {
  const { uploadFile, deleteFile, isUploading, progress } = useSupabaseUpload();
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setUploadResult(null);
      
      console.log('🚀 UploadTestTab: Starte Upload für:', file.name);
      
      const result = await uploadFile(file, 'media');
      
      if (result.error) {
        console.error('❌ UploadTestTab: Upload-Fehler:', result.error);
        setError(result.error);
      } else {
        console.log('✅ UploadTestTab: Upload erfolgreich:', result);
        setUploadResult(result as UploadResult);
      }
    } catch (err) {
      console.error('❌ UploadTestTab: Unerwarteter Fehler:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  };

  const handleDeleteFile = async () => {
    if (!uploadResult?.path) return;

    try {
      console.log('🗑️ UploadTestTab: Lösche Datei:', uploadResult.path);
      
      const success = await deleteFile(uploadResult.path, 'media');
      
      if (success) {
        console.log('✅ UploadTestTab: Datei erfolgreich gelöscht');
        setUploadResult(null);
      } else {
        console.error('❌ UploadTestTab: Lösch-Fehler');
        setError('Fehler beim Löschen der Datei');
      }
    } catch (err) {
      console.error('❌ UploadTestTab: Lösch-Fehler:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🧪 Upload Test
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Teste die Media-Upload-Funktionalität direkt aus dem Dashboard
        </p>
      </div>

      {/* Debug Auth Component */}
      {/* <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          🔐 Authentifizierung
        </h3>
        <DebugAuth />
      </div> */}
      
      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          📁 Datei Upload
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Wähle eine Datei zum Hochladen:
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 dark:file:bg-blue-900 dark:file:text-blue-300"
            />
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <div className="text-sm text-blue-600 dark:text-blue-400">⏳ Upload läuft...</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{progress}%</div>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 rounded">
              ❌ Fehler: {error}
            </div>
          )}
          
          {uploadResult && (
            <div className="p-4 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-500 rounded">
              <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">✅ Upload erfolgreich!</h4>
              <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                <div><strong>Pfad:</strong> {uploadResult.path}</div>
                <div><strong>URL:</strong> 
                  <a 
                    href={uploadResult.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    {uploadResult.url}
                  </a>
                </div>
              </div>
              
              <button
                onClick={handleDeleteFile}
                className="mt-3 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
              >
                🗑️ Datei löschen
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">📋 Test-Anweisungen:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>Überprüfe den Auth-Status oben</li>
          <li>Wähle eine Datei zum Hochladen</li>
          <li>Beobachte die Console-Logs</li>
          <li>Teste den Download-Link</li>
          <li>Lösche die Datei wenn gewünscht</li>
        </ol>
      </div>
    </div>
  );
}; 