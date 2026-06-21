"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Star, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageObject {
  path: string;
  isPrimary?: boolean;
  order?: number;
}

interface ImageUploadProps {
  value: string | string[] | ImageObject[];
  onChange: (value: any) => void;
  type: "products" | "blogs" | "dektons" | "sliders" | "banners" | "categories" | "inventory";
  multiple?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  type,
  multiple = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Normalize value to an array of objects or strings
  const getImagesList = (): ImageObject[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((img: any, index: number) => {
        if (typeof img === "string") {
          return { path: img, isPrimary: index === 0, order: index };
        }
        return {
          path: img.path,
          isPrimary: img.isPrimary ?? index === 0,
          order: img.order ?? index,
        };
      });
    }
    // Single string
    return [{ path: value as string, isPrimary: true, order: 0 }];
  };

  const imagesList = getImagesList();

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiClient.post(`/upload/${type}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Backend returns { success: true, data: { url: "/uploads/..." } }
      // but wait, standard NestJS transform interceptor wraps it to:
      // { success: true, data: { url: "/uploads/..." }, message: "OK", ... }
      return res.data?.data?.url || res.data?.url || null;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.message || `${file.name} yüklenirken bir hata oluştu.`
      );
      return null;
    }
  };

  const handleFiles = async (files: FileList) => {
    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        toast.error("Yalnızca görsel dosyaları (PNG, JPG, WEBP vb.) yükleyebilirsiniz.");
        continue;
      }
      const url = await uploadFile(file);
      if (url) {
        uploadedUrls.push(url);
      }
    }

    if (uploadedUrls.length > 0) {
      if (multiple) {
        // Append to existing images
        const newImages = [
          ...imagesList,
          ...uploadedUrls.map((url, idx) => ({
            path: url,
            isPrimary: imagesList.length === 0 && idx === 0,
            order: imagesList.length + idx,
          })),
        ];
        onChange(newImages);
      } else {
        onChange(uploadedUrls[0]);
      }
      toast.success("Görsel başarıyla yüklendi.");
    }
    setIsUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleRemove = (path: string) => {
    const filtered = imagesList.filter((img) => img.path !== path);
    
    // If we removed the primary image, set the first remaining image as primary
    if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
      filtered[0].isPrimary = true;
    }

    // Re-index orders
    const updated = filtered.map((img, idx) => ({
      ...img,
      order: idx,
    }));

    if (multiple) {
      onChange(updated);
    } else {
      onChange("");
    }
  };

  const handleSetPrimary = (path: string) => {
    if (!multiple) return;
    const updated = imagesList.map((img) => ({
      ...img,
      isPrimary: img.path === path,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Drop Zone */}
      {(multiple || imagesList.length === 0) && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[140px]",
            dragActive
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-gray-200 hover:border-primary/55 bg-zinc-50/50 hover:bg-zinc-50",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            onChange={handleChange}
            accept="image/*"
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-semibold text-zinc-500">Görsel yükleniyor...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-secondary">
                Dosya seçin veya sürükleyip bırakın
              </p>
              <p className="text-xs text-zinc-400 font-medium">
                PNG, JPG, JPEG, WEBP · Maksimum 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Previews Grid */}
      {imagesList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {imagesList.map((img) => (
            <div
              key={img.path}
              className={cn(
                "group relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 border border-gray-200 transition-all",
                img.isPrimary && multiple && "ring-2 ring-primary border-transparent"
              )}
            >
              <Image
                src={img.path}
                alt="Yüklenen görsel"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 30vw"
              />

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {multiple && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.path)}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      img.isPrimary
                        ? "bg-primary text-white"
                        : "bg-white/90 hover:bg-white text-zinc-600 hover:text-primary"
                    )}
                    title={img.isPrimary ? "Ana Görsel" : "Ana Görsel Yap"}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(img.path)}
                  className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                  title="Sil"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Badge */}
              {img.isPrimary && multiple && (
                <div className="absolute bottom-2 left-2 bg-primary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                  ANA GÖRSEL
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
