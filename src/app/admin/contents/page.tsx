"use client";

import { useEffect, useState } from "react";
import { Search, FolderOpen } from "lucide-react";
import ContentCard from "@/components/ContentCard";
import { CATEGORIES } from "@/lib/validation";

interface ContentItem {
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
  created_at: string;
}

export default function ContentsPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const res = await fetch("/api/contents");
      if (res.ok) {
        const data = await res.json();
        setContents(data.contents);
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus konten ini? Tindakan ini tidak bisa dibatalkan."))
      return;
    try {
      const res = await fetch(`/api/contents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setContents((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filtered = contents.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || c.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Kelola Konten</h1>
        <p className="page-description">
          Kelola semua konten Minecraft yang telah diupload
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              className="form-input"
              style={{ paddingLeft: "36px" }}
              type="text"
              placeholder="Cari konten..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ width: "180px" }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {filtered.length} konten
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "var(--text-muted)",
          }}
        >
          Memuat konten...
        </div>
      ) : filtered.length > 0 ? (
        <div className="content-grid">
          {filtered.map((content) => (
            <ContentCard
              key={content.id}
              id={content.id}
              title={content.title}
              description={content.description}
              category={content.category}
              thumbnailPath={content.thumbnail_path}
              fileSize={content.file_size}
              extension={content.extension}
              downloads={content.downloads}
              visits={content.visits}
              createdAt={content.created_at}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderOpen size={28} />
          </div>
          <div className="empty-state-title">
            {search || categoryFilter !== "all"
              ? "Tidak ada hasil"
              : "Belum ada konten"}
          </div>
          <div className="empty-state-desc">
            {search || categoryFilter !== "all"
              ? "Coba ubah filter pencarian"
              : "Upload konten Minecraft pertamamu"}
          </div>
          {!search && categoryFilter === "all" && (
            <a href="/admin/upload" className="btn btn-primary">
              Upload Sekarang
            </a>
          )}
        </div>
      )}
    </div>
  );
}
