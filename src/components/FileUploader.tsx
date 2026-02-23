"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  ALLOWED_EXTENSIONS,
  CATEGORIES,
  MAX_FILE_SIZE,
  CHUNK_SIZE,
  getFileExtension,
  validateContentFile,
  validateThumbnail,
  formatFileSize,
} from "@/lib/validation";

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("mod");
  const [supportedVersions, setSupportedVersions] = useState("");
  const [minecraftType, setMinecraftType] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [chunkInfo, setChunkInfo] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) selectFile(droppedFile);
  }, []);

  const selectFile = (f: File) => {
    const validation = validateContentFile(f.name, f.size);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }
    setFile(f);
    setError("");
    if (!title) {
      const name = f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      setTitle(name);
    }
  };

  const selectThumbnail = (f: File) => {
    const validation = validateThumbnail(f.name);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }
    setThumbnail(f);
    const reader = new FileReader();
    reader.onload = (e) => setThumbnailPreview(e.target?.result as string);
    reader.readAsDataURL(f);
    setError("");
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview("");
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setError("File dan judul wajib diisi.");
      return;
    }

    setUploading(true);
    setUploadStatus("uploading");
    setProgress(0);
    setError("");

    try {
      // Step 1: Initialize upload
      const initRes = await fetch("/api/upload/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, fileSize: file.size }),
      });

      if (!initRes.ok) {
        const data = await initRes.json();
        throw new Error(data.error || "Failed to initialize upload");
      }

      const { uploadId } = await initRes.json();

      // Step 2: Upload chunks
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("uploadId", uploadId);
        formData.append("chunkIndex", String(i));
        formData.append("chunk", chunk);

        const chunkRes = await fetch("/api/upload/chunk", {
          method: "POST",
          body: formData,
        });

        if (!chunkRes.ok) {
          throw new Error(`Failed to upload chunk ${i + 1}/${totalChunks}`);
        }

        const pct = Math.round(((i + 1) / totalChunks) * 90);
        setProgress(pct);
        setChunkInfo(`Chunk ${i + 1} / ${totalChunks}`);
      }

      // Step 3: Complete upload
      setChunkInfo("Menyimpan file...");
      const completeFormData = new FormData();
      completeFormData.append("uploadId", uploadId);
      completeFormData.append("totalChunks", String(totalChunks));
      completeFormData.append("filename", file.name);
      completeFormData.append("title", title.trim());
      completeFormData.append("description", description.trim());
      completeFormData.append("category", category);
      completeFormData.append("fileSize", String(file.size));

      if (thumbnail) {
        completeFormData.append("thumbnail", thumbnail);
        completeFormData.append("thumbnailName", thumbnail.name);
      }

      completeFormData.append("supportedVersions", supportedVersions.trim());
      completeFormData.append("minecraftType", minecraftType.trim());

      const completeRes = await fetch("/api/upload/complete", {
        method: "POST",
        body: completeFormData,
      });

      if (!completeRes.ok) {
        const data = await completeRes.json();
        throw new Error(data.error || "Failed to complete upload");
      }

      setProgress(100);
      setUploadStatus("success");
      setChunkInfo("Upload selesai!");

      // Reset form after success
      setTimeout(() => {
        setFile(null);
        setThumbnail(null);
        setThumbnailPreview("");
        setTitle("");
        setDescription("");
        setCategory("mod");
        setSupportedVersions("");
        setMinecraftType("");
        setProgress(0);
        setUploadStatus("idle");
        setChunkInfo("");
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload gagal";
      setError(message);
      setUploadStatus("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Error/Success Notifications */}
      {error && (
        <div className="notification notification-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="btn btn-ghost btn-icon btn-sm"
            style={{ marginLeft: "auto" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {uploadStatus === "success" && (
        <div className="notification notification-success">
          <CheckCircle size={18} />
          <span>Konten berhasil diupload!</span>
        </div>
      )}

      {/* File Drop Zone */}
      {!file ? (
        <div
          className={`upload-zone ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-zone-icon">
            <Upload size={28} />
          </div>
          <div className="upload-zone-title">
            Drag & drop file Minecraft di sini
          </div>
          <div className="upload-zone-desc">
            atau klik untuk memilih file • Maks {formatFileSize(MAX_FILE_SIZE)}
          </div>
          <div className="upload-zone-desc" style={{ marginTop: "8px" }}>
            Format: {ALLOWED_EXTENSIONS.join(", ")}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={(e) =>
              e.target.files?.[0] && selectFile(e.target.files[0])
            }
            style={{ display: "none" }}
          />
        </div>
      ) : (
        <div className="card" style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="card-icon green">
                <Upload size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>
                  {file.name}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {formatFileSize(file.size)} • {getFileExtension(file.name)}
                </div>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="btn btn-ghost btn-icon"
              disabled={uploading}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Form Fields */}
      {file && (
        <div className="card animate-fade-in" style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div className="form-group">
              <label className="form-label">Judul *</label>
              <input
                className="form-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nama konten Minecraft"
                disabled={uploading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={uploading}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat tentang konten ini..."
              disabled={uploading}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div className="form-group">
              <label className="form-label">Versi yang Didukung</label>
              <input
                className="form-input"
                type="text"
                value={supportedVersions}
                onChange={(e) => setSupportedVersions(e.target.value)}
                placeholder="Contoh: 1.20, 1.21, 1.21.50"
                disabled={uploading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tipe Minecraft</label>
              <select
                className="form-select"
                value={minecraftType}
                onChange={(e) => setMinecraftType(e.target.value)}
                disabled={uploading}
              >
                <option value="">Pilih tipe...</option>
                <option value="bedrock">Bedrock Edition</option>
                <option value="java">Java Edition</option>
                <option value="both">Bedrock & Java</option>
                <option value="fabric">Fabric</option>
                <option value="forge">Forge</option>
                <option value="neoforge">NeoForge</option>
                <option value="quilt">Quilt</option>
              </select>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="form-group">
            <label className="form-label">Thumbnail</label>
            {thumbnailPreview ? (
              <div className="thumbnail-preview">
                <img src={thumbnailPreview} alt="Preview" />
                <button
                  className="thumbnail-preview-remove"
                  onClick={removeThumbnail}
                  disabled={uploading}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => thumbInputRef.current?.click()}
                disabled={uploading}
              >
                <ImageIcon size={16} />
                Pilih Thumbnail
              </button>
            )}
            <input
              ref={thumbInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) =>
                e.target.files?.[0] && selectThumbnail(e.target.files[0])
              }
              style={{ display: "none" }}
            />
          </div>

          {/* Upload Progress */}
          {uploadStatus === "uploading" && (
            <div className="upload-progress">
              <div className="upload-progress-header">
                <span className="upload-progress-filename">Mengupload...</span>
                <span className="upload-progress-percent">{progress}%</span>
              </div>
              <div className="upload-progress-bar">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="upload-progress-details">
                <span>{chunkInfo}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploading || !title.trim()}
            >
              {uploading ? "Mengupload..." : "Upload Konten"}
            </button>
            {!uploading && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setFile(null);
                  setTitle("");
                  setDescription("");
                  setCategory("mod");
                  removeThumbnail();
                  setError("");
                }}
              >
                Batal
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
