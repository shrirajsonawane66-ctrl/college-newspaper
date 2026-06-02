"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Image, Link, CheckCircle } from "lucide-react";
import { uploadArticleThumbnail } from "@/lib/supabase";

export default function ThumbnailUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [urlInput, setUrlInput] = useState(value || "");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 300);

      const publicUrl = await uploadArticleThumbnail(file);
      clearInterval(progressInterval);
      setProgress(100);
      setPreview(publicUrl);
      onChange(publicUrl);
      setUrlInput(publicUrl);

      setTimeout(() => {
        setUploading(false);
      }, 400);
    } catch (err: unknown) {
      setUploading(false);
      setProgress(0);
      alert('Failed to upload image: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }, [uploadFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadFile(e.target.files[0]);
    }
  }, [uploadFile]);

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      const url = urlInput.trim();
      setPreview(url);
      onChange(url);
    }
  }, [urlInput, onChange]);

  const handleRemove = useCallback(() => {
    setPreview("");
    onChange("");
    setUrlInput("");
  }, [onChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-sm font-bold text-ink">Article Thumbnail</h3>
          <p className="text-[11px] text-ink-faded font-body">Upload or link a banner image for your article</p>
        </div>
        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border text-[10px] uppercase tracking-wider font-body font-semibold text-ink-light hover:bg-paper-dark transition-colors"
        >
          <Link className="w-3 h-3" />
          {showUrlInput ? "Upload" : "URL"}
        </button>
      </div>

      {preview ? (
        <div className="relative group">
          <div className="border border-border overflow-hidden bg-paper-dark relative" style={{ minHeight: "200px" }}>
            <img
              src={preview}
              alt="Article thumbnail"
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-contain max-h-[400px]"
              onError={() => setPreview("")}
            />
            {uploading && (
              <div className="absolute inset-0 bg-ink/60 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full border-2 border-gold/40 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gold-light" />
                </div>
                <div className="w-48 bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-body uppercase tracking-wider">
                  Uploading&hellip; {Math.round(Math.min(progress, 100))}%
                </p>
              </div>
            )}

            {!uploading && (
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="px-3 py-1.5 bg-paper/90 text-ink text-[10px] uppercase tracking-wider font-body font-semibold hover:bg-paper transition-colors"
                  >
                    Change
                  </button>
                  <button
                    onClick={handleRemove}
                    className="px-3 py-1.5 bg-red-500/80 text-white text-[10px] uppercase tracking-wider font-body font-semibold hover:bg-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-1.5 flex items-center justify-between">
            {!uploading && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-body">
                <CheckCircle className="w-3 h-3" />
                Thumbnail set
              </span>
            )}
          </div>
        </div>
      ) : showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL..."
            className="flex-1 px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded"
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          />
          <button
            onClick={handleUrlSubmit}
            className="px-3 py-2 bg-ink text-paper text-[10px] uppercase tracking-wider font-body font-semibold hover:bg-ink-light transition-colors shrink-0"
          >
            Apply
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? "border-gold bg-gold/5"
              : "border-border hover:border-gold-light hover:bg-paper-dark/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
              <Image className={`w-5 h-5 ${dragActive ? "text-gold" : "text-ink-faded"}`} />
            </div>
            <div>
              <p className="text-sm font-body text-ink-light">
                <span className="font-semibold text-ink">Click to upload</span> or drag and drop
              </p>
              <p className="text-[11px] text-ink-faded font-body mt-0.5">
                PNG, JPG or WEBP
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
