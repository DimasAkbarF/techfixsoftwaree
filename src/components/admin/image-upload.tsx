"use client";

import * as React from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import {
  IconUpload,
  IconX,
  IconLoader2,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  helperText?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Unggah Gambar",
  helperText = "Format PNG, JPG, WEBP maks 4MB",
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(value || null);
  const [customInputUrl, setCustomInputUrl] = React.useState<string>(value || "");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.ufsUrl || res?.[0]?.url;
      if (url) {
        setPreviewUrl(url);
        setCustomInputUrl(url);
        onChange(url);
        setErrorMsg(null);
      }
    },
    onUploadError: (err) => {
      setErrorMsg(err.message || "Gagal mengunggah gambar via UploadThing.");
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setErrorMsg(null);
      await startUpload(Array.from(files));
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setCustomInputUrl("");
    onChange(null);
  };

  const handleManualUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInputUrl(val);
    setPreviewUrl(val.trim().length > 0 ? val.trim() : null);
    onChange(val.trim().length > 0 ? val.trim() : null);
  };

  return (
    <div className="space-y-3">
      {errorMsg && (
        <Alert variant="danger">
          <IconAlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-xs">{errorMsg}</span>
        </Alert>
      )}

      {previewUrl ? (
        <div className="flex items-start gap-4 p-3 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-[var(--radius)]">
          <div className="w-20 h-20 rounded-[var(--radius)] overflow-hidden border border-[var(--color-border)] bg-[#F9FAFB] shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setErrorMsg("Gambar tidak dapat dimuat dari URL ini")}
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-success)] font-medium">
              <IconCheck className="w-4 h-4" />
              <span>Gambar Tersedia</span>
            </div>
            <p className="text-xs font-mono text-[var(--color-muted)] truncate">
              {previewUrl}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="gap-1 mt-2 text-xs h-8 text-[var(--color-danger)] hover:bg-[#FCE8E6]"
            >
              <IconX className="w-3.5 h-3.5" />
              <span>Hapus Gambar</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <label
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium border border-[var(--color-border)] rounded-[var(--radius)] bg-[var(--color-surface)] hover:bg-[#F1F4F6] cursor-pointer transition-colors ${
                isUploading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {isUploading ? (
                <>
                  <IconLoader2 className="w-4 h-4 animate-spin text-[var(--color-accent)]" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <IconUpload className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>{label}</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            <span className="text-xs text-[var(--color-muted)] text-center sm:text-left">
              atau masukkan URL langsung:
            </span>
          </div>

          <Input
            value={customInputUrl}
            onChange={handleManualUrlChange}
            placeholder="https://utfs.io/f/... atau URL gambar eksternal"
            className="text-xs font-mono h-9"
          />

          <p className="text-[11px] text-[var(--color-muted)]">{helperText}</p>
        </div>
      )}
    </div>
  );
}
