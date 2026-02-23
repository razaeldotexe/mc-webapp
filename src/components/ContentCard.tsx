"use client";

import { Download, Trash2, FileArchive, Eye } from "lucide-react";
import { formatFileSize } from "@/lib/validation";

interface ContentCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailPath: string;
  fileSize: number;
  extension: string;
  downloads?: number;
  visits?: number;
  createdAt: string;
  onDelete: (id: string) => void;
}

export default function ContentCard({
  id,
  title,
  description,
  category,
  thumbnailPath,
  fileSize,
  extension,
  downloads = 0,
  visits = 0,
  createdAt,
  onDelete,
}: ContentCardProps) {
  return (
    <div className="content-card animate-fade-in">
      {thumbnailPath ? (
        <img
          src={thumbnailPath}
          alt={title}
          className="content-card-thumb"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div className="content-card-thumb">
          <FileArchive size={40} />
        </div>
      )}
      <div className="content-card-body">
        <div className="content-card-title" title={title}>
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              marginTop: "2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {description}
          </div>
        )}
        <div className="content-card-meta">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={`badge badge-${category}`}>{category}</span>
              <span className="content-card-size">
                {formatFileSize(fileSize)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Eye size={14} />
                <span>{visits} views</span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Download size={14} />
                <span>{downloads} downloads</span>
              </div>
            </div>
          </div>
          <div className="content-card-actions">
            <a
              href={`/api/download/${id}`}
              className="btn btn-ghost btn-icon"
              title="Download"
              style={{ width: "32px", height: "32px", padding: "4px" }}
            >
              <Download size={16} />
            </a>
            <button
              onClick={() => onDelete(id)}
              className="btn btn-ghost btn-icon"
              title="Hapus"
              style={{
                width: "32px",
                height: "32px",
                padding: "4px",
                color: "var(--danger)",
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            marginTop: "8px",
          }}
        >
          {extension} •{" "}
          {new Date(createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}
