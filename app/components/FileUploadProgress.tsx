"use client";

import { useState, useRef, useCallback } from "react";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ProgressBar from "./ProgressBar";
import LoadingSpinner from "./LoadingSpinner";

interface FileUploadProgressProps {
  onFileSelect: (file: File) => void;
  onSubmit: (file: File) => Promise<void>;
  acceptedTypes: string[];
  acceptedExtensions: string[];
  maxSize: number; // in bytes
  uploadType: "image" | "document";
  isLoading?: boolean;
  className?: string;
}

export default function FileUploadProgress({
  onFileSelect,
  onSubmit,
  acceptedTypes,
  acceptedExtensions,
  maxSize,
  uploadType,
  isLoading = false,
  className = "",
}: FileUploadProgressProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      setFile(selectedFile);
      onFileSelect(selectedFile);

      // Create image preview for image uploads
      if (uploadType === "image" && selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }

      // Simulate upload progress for better UX
      if (isLoading) {
        setUploadProgress(0);
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90; // Stop at 90% until actual completion
            }
            return prev + Math.random() * 15;
          });
        }, 200);
      }
    },
    [onFileSelect, uploadType, isLoading]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploadProgress(0);
      await onSubmit(file);
      setUploadProgress(100);
    } catch (error) {
      setUploadProgress(0);
    }
  };

  const clearFile = () => {
    setFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getIcon = () => {
    return uploadType === "image" ? PhotoIcon : DocumentTextIcon;
  };

  const Icon = getIcon();

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag and Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragOver
              ? "border-[#037BFC] bg-[#037BFC]/5 dark:bg-[#037BFC]/10"
              : "border-gray-300 dark:border-gray-600 hover:border-[#037BFC] hover:bg-gray-50 dark:hover:bg-gray-700/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(",")}
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
            aria-label={`Upload ${uploadType}`}
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              {isLoading ? (
                <LoadingSpinner size="lg" />
              ) : (
                <Icon className="h-12 w-12 text-gray-400" />
              )}
            </div>

            {file ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Selected file:
                  </p>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Remove file"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-[#037BFC]">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-gray-500">
                    ({formatFileSize(file.size)})
                  </span>
                </div>

                {/* Image Preview */}
                {imagePreview && uploadType === "image" && (
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-xs max-h-48 rounded-lg shadow-md object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {isLoading && uploadProgress > 0 && (
                  <div className="max-w-xs mx-auto">
                    <ProgressBar
                      progress={uploadProgress}
                      label="Uploading..."
                      size="sm"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {isLoading ? "Processing..." : `Drop your ${uploadType} here`}
                </p>
                {!isLoading && (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      or click to browse files
                    </p>
                    <p className="text-xs text-gray-400">
                      Supports {acceptedExtensions.join(", ")} (max{" "}
                      {formatFileSize(maxSize)})
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!file || isLoading}
            className={`rounded-md px-6 py-3 text-sm font-semibold text-white transition-all transform focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2 ${
              !file || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#037BFC] hover:bg-[#0260c9] hover:scale-105"
            }`}
            aria-label={`Analyze ${uploadType}`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" color="white" />
                <span>
                  {uploadType === "image"
                    ? "Analyzing Image..."
                    : "Analyzing Document..."}
                </span>
              </div>
            ) : (
              `Analyze ${uploadType === "image" ? "Image" : "Document"}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
