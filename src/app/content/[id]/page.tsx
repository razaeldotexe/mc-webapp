"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Eye,
  FileArchive,
  Calendar,
  HardDrive,
  Tag,
  Gamepad2,
  Layers,
  File,
} from "lucide-react";
import { formatFileSize } from "@/lib/validation";

interface ContentDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  file_path: string;
  thumbnail_path: string;
  file_size: number;
  extension: string;
  downloads: number;
  visits: number;
  supported_versions: string;
  minecraft_type: string;
  created_at: string;
}

const MC_TYPE_LABELS: Record<string, string> = {
  bedrock: "Bedrock Edition",
  java: "Java Edition",
  both: "Bedrock & Java",
  fabric: "Fabric",
  forge: "Forge",
  neoforge: "NeoForge",
  quilt: "Quilt",
};

const MC_TYPE_COLORS: Record<string, string> = {
  bedrock: "#4fc3f7",
  java: "#ffb74d",
  both: "#81c784",
  fabric: "#ce93d8",
  forge: "#ef5350",
  neoforge: "#ff7043",
  quilt: "#7986cb",
};

export default function ContentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) fetchContent();
  }, [id]);

  const fetchContent = async () => {
    try {
      const res = await fetch(`/api/contents/${id}`);
      if (!res.ok) {
        setError("Konten tidak ditemukan");
        return;
      }
      const data = await res.json();
      setContent(data);
    } catch {
      setError("Gagal memuat konten");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div className="detail-loading">
          <div className="v-loading-spinner" />
          <span>Memuat detail konten...</span>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="detail-page">
        <div className="detail-error">
          <FileArchive size={48} />
          <h2>{error || "Konten tidak ditemukan"}</h2>
          <Link
            href="/"
            className="btn btn-primary"
            style={{ marginTop: "16px" }}
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const versions = content.supported_versions
    ? content.supported_versions
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

  const mcType = content.minecraft_type || "";
  const mcLabel = MC_TYPE_LABELS[mcType] || mcType;
  const mcColor = MC_TYPE_COLORS[mcType] || "#94a3b8";

  return (
    <div className="detail-page">
      {/* Back Navigation */}
      <div className="detail-nav">
        <Link href="/" className="detail-back-btn">
          <ArrowLeft size={18} />
          <span>Kembali</span>
        </Link>
      </div>

      <div className="detail-layout">
        {/* Left: Thumbnail */}
        <div className="detail-thumb-section">
          {content.thumbnail_path ? (
            <img
              src={content.thumbnail_path}
              alt={content.title}
              className="detail-thumb-img"
            />
          ) : (
            <div className="detail-thumb-placeholder">
              <FileArchive size={64} />
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="detail-info-section">
          <div className="detail-header">
            <span
              className={`badge badge-${content.category}`}
              style={{ fontSize: "13px" }}
            >
              {content.category}
            </span>
            {mcType && (
              <span
                className="detail-mc-badge"
                style={{
                  backgroundColor: `${mcColor}20`,
                  color: mcColor,
                  borderColor: `${mcColor}40`,
                }}
              >
                <Gamepad2 size={14} />
                {mcLabel}
              </span>
            )}
          </div>

          <h1 className="detail-title">{content.title}</h1>

          {content.description && (
            <p className="detail-description">{content.description}</p>
          )}

          {/* Stats Row */}
          <div className="detail-stats">
            <div className="detail-stat">
              <Eye size={16} />
              <span>{content.visits} views</span>
            </div>
            <div className="detail-stat">
              <Download size={16} />
              <span>{content.downloads} downloads</span>
            </div>
            <div className="detail-stat">
              <Calendar size={16} />
              <span>
                {new Date(content.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Info Cards */}
          <div className="detail-info-grid">
            <div className="detail-info-card">
              <div className="detail-info-card-icon">
                <HardDrive size={18} />
              </div>
              <div>
                <div className="detail-info-card-label">Ukuran File</div>
                <div className="detail-info-card-value">
                  {formatFileSize(content.file_size)}
                </div>
              </div>
            </div>

            <div className="detail-info-card">
              <div className="detail-info-card-icon">
                <File size={18} />
              </div>
              <div>
                <div className="detail-info-card-label">Nama File</div>
                <div className="detail-info-card-value">
                  {content.title}
                  {content.extension}
                </div>
              </div>
            </div>

            <div className="detail-info-card">
              <div className="detail-info-card-icon">
                <Tag size={18} />
              </div>
              <div>
                <div className="detail-info-card-label">Format</div>
                <div className="detail-info-card-value">
                  {content.extension}
                </div>
              </div>
            </div>

            {mcType && (
              <div className="detail-info-card">
                <div
                  className="detail-info-card-icon"
                  style={{ color: mcColor }}
                >
                  <Gamepad2 size={18} />
                </div>
                <div>
                  <div className="detail-info-card-label">Tipe Minecraft</div>
                  <div className="detail-info-card-value">{mcLabel}</div>
                </div>
              </div>
            )}
          </div>

          {/* Supported Versions */}
          {versions.length > 0 && (
            <div className="detail-versions">
              <div className="detail-versions-label">
                <Layers size={16} />
                <span>Versi yang Didukung</span>
              </div>
              <div className="detail-versions-list">
                {versions.map((v, i) => (
                  <span key={i} className="detail-version-tag">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Download Button */}
          <a
            href={`/api/download/${content.id}`}
            className="detail-download-btn"
          >
            <Download size={20} />
            Download {content.title} ({formatFileSize(content.file_size)})
          </a>
        </div>
      </div>
    </div>
  );
}
