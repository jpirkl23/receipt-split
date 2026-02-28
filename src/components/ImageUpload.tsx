"use client";

import React, { useRef, useState } from "react";
import { Button } from "./Button";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isLoading?: boolean;
}

export function ImageUpload({ onImageSelect, isLoading = false }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if it's an image file
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
      } else {
        alert('Please drop an image file (PNG, JPG, or WebP)');
      }
    }
  };

  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      alert("Unable to access camera. Please ensure you have granted permissions.");
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "receipt.png", { type: "image/png" });
            onImageSelect(file);
            handleCloseCamera();
          }
        });
      }
    }
  };

  const handleCloseCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraOpen(false);
    }
  };

  if (isCameraOpen) {
    return (
      <div className="flex flex-col items-center gap-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full max-w-md rounded-lg shadow-lg"
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-2">
          <Button onClick={handleCapture} variant="success" size="lg">
            📸 Capture
          </Button>
          <Button onClick={handleCloseCamera} variant="secondary" size="lg">
            ✕ Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-600 bg-blue-100 scale-105'
            : 'border-blue-300 bg-blue-50 hover:border-blue-500'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-2xl mb-2">📸</p>
        <p className="text-lg font-semibold text-gray-700 mb-2">
          {isDragging ? 'Drop receipt here' : 'Click or drag to upload receipt'}
        </p>
        <p className="text-sm text-gray-500">PNG, JPG, or WebP • Up to 10MB</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-2 flex-col sm:flex-row">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={isLoading}
        >
          📤 Upload Image
        </Button>
        <Button
          onClick={handleOpenCamera}
          variant="secondary"
          size="lg"
          className="flex-1"
          disabled={isLoading}
        >
          📱 Take Photo
        </Button>
      </div>
    </div>
  );
}
