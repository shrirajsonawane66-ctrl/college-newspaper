"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, CheckCircle, XCircle, Link as LinkIcon } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

interface ImageUploaderProps {
  onUploadComplete: (publicUrl: string) => void;
  onUploadStart?: () => void;
  initialValue?: string;
}

export default function ImageUploader({ onUploadComplete, onUploadStart, initialValue }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(initialValue || "");
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState(initialValue || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setError(null);
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const blobUrl = URL.createObjectURL(file);
    blobUrlRef.current = blobUrl;
    setPreview(blobUrl);
    setUploading(true);
    setProgress(10);
    onUploadStart?.();

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + 15, 85));
    }, 300);

    try {
      const supabase = getSupabaseClient();
      const ext = file.name.split(".").pop();
      const fileName = `articles/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        setProgress(0);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("article-images").getPublicUrl(data.path);

      setProgress(100);
      setPreview(publicUrl);
      setUrlInput(publicUrl);
      setUploading(false);
      onUploadComplete(publicUrl);
    } catch {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setError("Upload failed. Please try again.");
      setUploading(false);
      setProgress(0);
    }
  }, [onUploadComplete, onUploadStart]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      const url = urlInput.trim();
      setPreview(url);
      setError(null);
      onUploadComplete(url);
    }
  }, [urlInput, onUploadComplete]);

  const handleRemove = useCallback(() => {
    setPreview("");
    setUrlInput("");
    setError(null);
    onUploadComplete("");
  }, [onUploadComplete]);

  if (preview && !uploading) {
    return (
      <div className="space-y-2">
        <div className="relative group">
          <div className="border border-border overflow-hidden bg-paper-dark" style={{ minHeight: "150px" }}>
            <img
              src={preview}
              alt="Preview"
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-contain max-h-[300px]"
              onError={() => setPreview("")}
            />
            <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="px-3 py-1.5 bg-paper/90 text-ink text-[10px] uppercase tracking-wider font-semibold hover:bg-paper transition-colors"
                >
                  Change
                </button>
                <button
                  onClick={handleRemove}
                  className="px-3 py-1.5 bg-red-500/80 text-white text-[10px] uppercase tracking-wider font-semibold hover:bg-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 mt-1">
            <CheckCircle className="w-3 h-3" />
            Image ready
          </span>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-ink-faded font-sans">Upload or link an image</p>
        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border text-[10px] uppercase tracking-wider font-semibold text-ink-light hover:bg-paper-dark transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlInput ? "Upload" : "URL"}
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL..."
            className="flex-1 px-3 py-2 text-sm border border-border bg-paper focus:outline-none placeholder:text-ink-faded"
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          />
          <button onClick={handleUrlSubmit} className="px-3 py-2 bg-ink text-paper text-[10px] uppercase tracking-wider font-semibold hover:bg-ink-light transition-colors shrink-0">
            Apply
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="relative border-2 border-dashed p-8 text-center cursor-pointer hover:border-gold-light hover:bg-paper-dark/50 transition-all"
          onClick={() => !uploading && inputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-gold/40 flex items-center justify-center">
                <Upload className="w-5 h-5 text-gold-light" />
              </div>
              <div className="w-48 bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-gold rounded-full transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <p className="text-[10px] text-ink-faded uppercase tracking-wider">
                Uploading&hellip; {Math.round(Math.min(progress, 100))}%
              </p>
            </div>
          ) : (
            <>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                  <Upload className="w-5 h-5 text-ink-faded" />
                </div>
                <div>
                  <p className="text-sm text-ink-light">
                    <span className="font-semibold text-ink">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-[11px] text-ink-faded mt-0.5">JPG, PNG, WebP &mdash; max 5MB</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-red-600">
          <XCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
}
