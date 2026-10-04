'use client';

import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { uploadDocuments, DocumentMetadata } from '@/lib/api';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (docs: DocumentMetadata[]) => void;
}

export default function DocumentUploadModal({ isOpen, onClose, onUploadSuccess }: ModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [processedResults, setProcessedResults] = useState<DocumentMetadata[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles(filesArray);
      setErrorMessage(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus('Uploading & Extracting text chunks...');
    setErrorMessage(null);

    try {
      const results = await uploadDocuments(selectedFiles);
      setProcessedResults(results);
      setUploadStatus('✓ Document indexed successfully');
      onUploadSuccess(results);
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadStatus(null);
        setProcessedResults([]);
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process document upload');
      setUploadStatus(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-white text-base">Upload Documents</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-700 hover:border-red-500/50 bg-slate-950/60 rounded-xl p-8 text-center transition cursor-pointer group"
          >
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.md"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer block space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-red-950/60 flex items-center justify-center mx-auto transition">
                <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  <span className="text-red-400 underline underline-offset-2">Click to browse</span> or drag and drop files here
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, and TXT format</p>
              </div>
            </label>
          </div>

          {/* Selected File List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Selected Files ({selectedFiles.length})
              </span>
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-200 font-medium truncate">{file.name}</span>
                  </div>
                  <span className="text-slate-400 text-[11px] shrink-0 font-mono">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Status Alert */}
          {uploadStatus && (
            <div className={`p-3 rounded-lg flex items-center space-x-2 text-xs font-medium ${
              uploadStatus.includes('✓') ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300' : 'bg-blue-950/70 border border-blue-800 text-blue-300'
            }`}>
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{uploadStatus}</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-red-300 flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50 flex items-center space-x-1.5 shadow-lg shadow-red-950/50"
          >
            {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isUploading ? 'Processing...' : 'Upload & Index'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
