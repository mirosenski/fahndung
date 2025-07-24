"use client";

import { useState } from 'react';
import { useSupabaseUpload } from '~/hooks/useSupabaseUpload';
import { DebugAuth } from './DebugAuth';

export const UploadTest = () => {
  const { uploadFile, deleteFile, isUploading, progress } = useSupabaseUpload();
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setUploadResult(null);
      
      console.log('🚀 UploadTest: Starte Upload für:', file.name);
      
      const result = await uploadFile(file, 'media');
      
      if (result.error) {
        console.error('❌ UploadTest: Upload-Fehler:', result.error);
        setError(result.error);
      } else {
        console.log('✅ UploadTest: Upload erfolgreich:', result);
        setUploadResult(result);
      }
    } catch (err) {
      console.error('❌ UploadTest: Unerwarteter Fehler:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  };

  const handleDeleteFile = async () => {
    if (!uploadResult?.path) return;

    try {
      console.log('🗑️ UploadTest: Lösche Datei:', uploadResult.path);
      
      const success = await deleteFile(uploadResult.path, 'media');
      
      if (success) {
        console.log('✅ UploadTest: Datei erfolgreich gelöscht');
        setUploadResult(null);
      } else {
        console.error('❌ UploadTest: Lösch-Fehler');
        setError('Fehler beim Löschen der Datei');
      }
    } catch (err) {
      console.error('❌ UploadTest: Lösch-Fehler:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🧪 Upload Test</h2>
      
      {/* Debug Auth Component */}
      <div className="mb-6">
        <DebugAuth />
      </div>
      
      {/* Upload Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">📁 Datei Upload</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Wähle eine Datei zum Hochladen:
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <div className="text-sm text-blue-600">⏳ Upload läuft...</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600">{progress}%</div>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              ❌ Fehler: {error}
            </div>
          )}
          
          {uploadResult && (
            <div className="p-4 bg-green-100 border border-green-400 rounded">
              <h4 className="font-semibold text-green-800 mb-2">✅ Upload erfolgreich!</h4>
              <div className="space-y-1 text-sm text-green-700">
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
                className="mt-3 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                🗑️ Datei löschen
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded">
        <h4 className="font-semibold mb-2">📋 Test-Anweisungen:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
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