import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, FileImage, FileVideo, File, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useMediaStore } from '~/stores/media.store';
import { api } from '~/trpc/react';

interface MediaUploadProps {
  onClose: () => void;
  onSuccess: (items: any[]) => void;
  directory?: string;
  allowedTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
}

interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: any;
}

const ACCEPTED_TYPES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 20;

export default function MediaUpload({
  onClose,
  onSuccess,
  directory = 'allgemein',
  allowedTypes,
  maxFiles = MAX_FILES,
  maxSize = MAX_FILE_SIZE
}: MediaUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState(directory);
  const [isUploading, setIsUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  const { setDragging } = useMediaStore();
  const createUploadUrl = api.media.createUploadUrl.useMutation();
  const confirmUpload = api.media.confirmUpload.useMutation();
  const { data: directories = [] } = api.media.getDirectories.useQuery();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setDragging(false);
    
    // Handle rejected files
    rejectedFiles.forEach(rejection => {
      console.warn('Rejected file:', rejection.file.name, rejection.errors);
    });

    // Process accepted files
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
  }, [maxFiles, setDragging]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes ? 
      Object.fromEntries(allowedTypes.map(type => [type, []])) : 
      ACCEPTED_TYPES,
    maxSize,
    maxFiles,
    multiple: true,
    onDragEnter: () => setDragging(true),
    onDragLeave: () => setDragging(false)
  });

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      // Revoke object URL to prevent memory leaks
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return updated;
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const uploadFile = async (uploadFile: UploadFile): Promise<any> => {
    try {
      // Update status
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      // Get signed upload URL
      const { uploadUrl, token, path, fileName } = await createUploadUrl.mutateAsync({
        fileName: uploadFile.file.name,
        fileSize: uploadFile.file.size,
        mimeType: uploadFile.file.type,
        directory: selectedDirectory,
        tags,
        description,
        is_public: true
      });

      // Upload to Supabase Storage with progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id ? { ...f, progress } : f
            ));
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status === 200) {
            try {
              // Extract image dimensions if it's an image
              let width: number | undefined;
              let height: number | undefined;

              if (uploadFile.file.type.startsWith('image/')) {
                const img = new Image();
                await new Promise((resolve) => {
                  img.onload = () => {
                    width = img.width;
                    height = img.height;
                    resolve(void 0);
                  };
                  img.onerror = () => resolve(void 0);
                  img.src = uploadFile.preview || URL.createObjectURL(uploadFile.file);
                });
              }

              // Confirm upload and create database record
              const result = await confirmUpload.mutateAsync({
                path,
                fileName,
                metadata: {
                  fileName: uploadFile.file.name,
                  fileSize: uploadFile.file.size,
                  mimeType: uploadFile.file.type,
                  directory: selectedDirectory,
                  tags,
                  description,
                  is_public: true
                },
                width,
                height
              });

              setFiles(prev => prev.map(f => 
                f.id === uploadFile.id 
                  ? { ...f, status: 'success', progress: 100, result }
                  : f
              ));

              resolve(result);
            } catch (error) {
              setFiles(prev => prev.map(f => 
                f.id === uploadFile.id 
                  ? { ...f, status: 'error', error: 'Fehler beim Bestätigen des Uploads' }
                  : f
              ));
              reject(error);
            }
          } else {
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, status: 'error', error: `Upload fehlgeschlagen (${xhr.status})` }
                : f
            ));
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'error', error: 'Netzwerkfehler beim Upload' }
              : f
          ));
          reject(new Error('Network error'));
        });

        xhr.open('POST', uploadUrl);
        xhr.send(uploadFile.file);
      });
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: 'Fehler beim Upload' }
          : f
      ));
      throw error;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const results: any[] = [];

    try {
      // Upload files in parallel (with limit)
      const BATCH_SIZE = 3;
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(file => uploadFile(file));
        
        try {
          const batchResults = await Promise.allSettled(batchPromises);
          batchResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              results.push(result.value);
            }
          });
        } catch (error) {
          console.error('Batch upload error:', error);
        }
      }

      if (results.length > 0) {
        onSuccess(results);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.startsWith('video/')) return FileVideo;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasErrors = files.some(f => f.status === 'error');
  const allUploaded = files.length > 0 && files.every(f => f.status === 'success');
  const totalProgress = files.length > 0 
    ? files.reduce((sum, f) => sum + f.progress, 0) / files.length 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Medien hochladen</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Dateien hier ablegen...' : 'Dateien hochladen'}
            </p>
            <p className="text-gray-500 mb-4">
              Ziehen Sie Dateien hierher oder klicken Sie zum Auswählen
            </p>
            <p className="text-sm text-gray-400">
              Maximal {maxFiles} Dateien, je bis zu {formatFileSize(maxSize)}
            </p>
          </div>

          {/* Settings */}
          {files.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Directory Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verzeichnis
                </label>
                <select
                  value={selectedDirectory}
                  onChange={(e) => setSelectedDirectory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {directories.map(dir => (
                    <option key={dir} value={dir}>{dir}</option>
                  ))}
                  <option value="neu">+ Neues Verzeichnis</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschreibung für alle Dateien..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Tag hinzufügen..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hinzufügen
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Dateien ({files.length})
                </h3>
                {isUploading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {Math.round(totalProgress)}% hochgeladen
                  </div>
                )}
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {files.map(file => {
                  const FileIcon = getFileIcon(file.file.type);
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      {/* Preview/Icon */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileIcon className="h-6 w-6 text-gray-500" />
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.file.size)}
                        </p>
                      </div>

                      {/* Progress/Status */}
                      <div className="flex-shrink-0 w-24">
                        {file.status === 'pending' && (
                          <span className="text-xs text-gray-500">Warteschlange</span>
                        )}
                        {file.status === 'uploading' && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        )}
                        {file.status === 'success' && (
                          <div className="flex items-center text-green-600">
                            <Check className="h-4 w-4" />
                            <span className="ml-1 text-xs">Fertig</span>
                          </div>
                        )}
                        {file.status === 'error' && (
                          <div className="flex items-center text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="ml-1 text-xs">Fehler</span>
                          </div>
                        )}
                      </div>

                      {/* Remove Button */}
                      {file.status !== 'uploading' && (
                        <button
                          onClick={() => removeFile(file.id)}
                          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            {files.length > 0 && (
              <>
                {files.filter(f => f.status === 'success').length} von {files.length} erfolgreich
                {hasErrors && (
                  <span className="text-red-600 ml-2">
                    ({files.filter(f => f.status === 'error').length} Fehler)
                  </span>
                )}
              </>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isUploading}
            >
              {allUploaded ? 'Schließen' : 'Abbrechen'}
            </button>
            
            {files.length > 0 && !allUploaded && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isUploading ? 'Wird hochgeladen...' : 'Hochladen'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}