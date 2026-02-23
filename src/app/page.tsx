"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileSidebarToggle from "@/components/MobileSidebarToggle";
import ThemeApplier from "@/components/ThemeApplier";
import {
  Download,
  Search,
  FileArchive,
  Box,
  FolderOpen,
  HardDrive,
  TrendingUp,
  Package,
  Eye,
  Shield,
} from "lucide-react";
import { formatFileSize, CATEGORIES } from "@/lib/validation";

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

interface StorageData {
  used: number;
  total: number;
  percentage: number;
  contentCount: number;
  byCategory: { category: string; count: number; total_size: number }[];
}

export default function PublicHomePage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [visitorTheme, setVisitorTheme] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contentsRes, storageRes] = await Promise.all([
        fetch("/api/contents"),
        fetch("/api/storage"),
      ]);
      if (contentsRes.ok) {
        const data = await contentsRes.json();
        setContents(data.contents);
      }
      if (storageRes.ok) {
        setStats(await storageRes.json());
      }

      // Fetch theme
      try {
        const themeRes = await fetch("/api/settings");
        if (themeRes.ok) {
          const themeData = await themeRes.json();
          if (themeData.visitor_theme_color)
            setVisitorTheme(themeData.visitor_theme_color);
        }
      } catch {}
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (id: string) => {
    router.push(`/content/${id}`);
  };

  const filtered = contents.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || c.category === category;
    return matchSearch && matchCategory;
  });

  const totalDownloadSize = contents.reduce((sum, c) => sum + c.file_size, 0);

  return (
    <div className={`v-page ${isSidebarOpen ? "sidebar-open" : ""}`}>
      {visitorTheme && <ThemeApplier color={visitorTheme} target="visitor" />}
      {isSidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Sidebar / Navbar */}
      <aside className="v-sidebar">
        <div className="v-sidebar-header">
          <div className="v-sidebar-logo">
            <Box size={20} />
          </div>
          <div>
            <div className="v-sidebar-title">ELFox</div>
            <div className="v-sidebar-subtitle">Download Portal</div>
          </div>
        </div>

        <nav className="v-sidebar-nav">
          <span className="v-sidebar-section">Kategori</span>
          <button
            className={`v-nav-link ${category === "all" ? "active" : ""}`}
            onClick={() => setCategory("all")}
          >
            <Package size={18} />
            <span>Semua Konten</span>
            <span className="v-nav-badge">{contents.length}</span>
          </button>
          {CATEGORIES.map((cat) => {
            const count = contents.filter(
              (c) => c.category === cat.value,
            ).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.value}
                className={`v-nav-link ${category === cat.value ? "active" : ""}`}
                onClick={() => setCategory(cat.value)}
              >
                <FolderOpen size={18} />
                <span>{cat.label}</span>
                <span className="v-nav-badge">{count}</span>
              </button>
            );
          })}
        </nav>

        <div className="v-sidebar-footer">
          <Link
            href="/admin"
            className="v-nav-link"
            style={{ color: "#94a3b8" }}
          >
            <Shield size={18} />
            <span>Admin Panel</span>
          </Link>
          <div className="v-sidebar-footer-text">
            Minecraft Content Platform
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="v-main">
        {/* Header */}
        <div
          className="v-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="mobile-only-flex">
              <MobileSidebarToggle
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              />
            </div>
            <div>
              <h1 className="v-page-title">Download Konten</h1>
              <p className="v-page-desc">
                Temukan dan download mods, skins, worlds, dan konten Minecraft
                lainnya
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="v-stats-grid">
          <div className="v-stat-card v-stat-glow">
            <div className="v-stat-content">
              <div className="v-stat-label">Total Konten</div>
              <div className="v-stat-value">{stats?.contentCount || 0}</div>
              <div className="v-stat-sub">file tersedia</div>
            </div>
            <div className="v-stat-icon blue">
              <FileArchive size={22} />
            </div>
          </div>

          <div className="v-stat-card">
            <div className="v-stat-content">
              <div className="v-stat-label">Total Ukuran</div>
              <div className="v-stat-value">
                {formatFileSize(totalDownloadSize)}
              </div>
              <div className="v-stat-sub">siap didownload</div>
            </div>
            <div className="v-stat-icon cyan">
              <HardDrive size={22} />
            </div>
          </div>

          <div className="v-stat-card">
            <div className="v-stat-content">
              <div className="v-stat-label">Kategori</div>
              <div className="v-stat-value">
                {stats?.byCategory?.length || 0}
              </div>
              <div className="v-stat-sub">tipe konten</div>
            </div>
            <div className="v-stat-icon purple">
              <FolderOpen size={22} />
            </div>
          </div>

          <div className="v-stat-card">
            <div className="v-stat-content">
              <div className="v-stat-label">Terbaru</div>
              <div className="v-stat-value">
                {contents.length > 0
                  ? new Date(contents[0].created_at).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "short" },
                    )
                  : "—"}
              </div>
              <div className="v-stat-sub">upload terakhir</div>
            </div>
            <div className="v-stat-icon indigo">
              <TrendingUp size={22} />
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="v-toolbar">
          <div className="v-search-wrapper">
            <Search size={18} className="v-search-icon" />
            <input
              className="v-search-input"
              type="text"
              placeholder="Cari konten Minecraft..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="v-toolbar-count">{filtered.length} hasil</span>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="v-loading">
            <div className="v-loading-spinner" />
            <span>Memuat konten...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="v-grid">
            {filtered.map((content, index) => (
              <div
                key={content.id}
                className="v-card"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  cursor: "pointer",
                }}
                onClick={() => handleCardClick(content.id)}
              >
                {content.thumbnail_path ? (
                  <img
                    src={content.thumbnail_path}
                    alt={content.title}
                    className="v-card-thumb"
                  />
                ) : (
                  <div className="v-card-thumb v-card-thumb-placeholder">
                    <FileArchive size={36} />
                  </div>
                )}
                <div className="v-card-body">
                  <div className="v-card-top">
                    <span className={`badge badge-${content.category}`}>
                      {content.category}
                    </span>
                    <span className="v-card-ext">{content.extension}</span>
                  </div>
                  <h3 className="v-card-title">{content.title}</h3>
                  {content.description && (
                    <p className="v-card-desc">{content.description}</p>
                  )}

                  {/* Metrics Row */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginTop: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Eye size={14} />
                      <span>{content.visits || 0} views</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Download size={14} />
                      <span>{content.downloads || 0} downloads</span>
                    </div>
                  </div>

                  <div className="v-card-footer">
                    <div className="v-card-meta">
                      <span>{formatFileSize(content.file_size)}</span>
                      <span>•</span>
                      <span>
                        {new Date(content.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <a
                      href={`/api/download/${content.id}`}
                      className="v-download-btn"
                      onClick={(e) => {
                        // Prevent the click from navigating if the card itself was clickable
                        e.stopPropagation();
                      }}
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="v-empty">
            <div className="v-empty-icon">
              <FileArchive size={36} />
            </div>
            <h3 className="v-empty-title">
              {search || category !== "all"
                ? "Tidak ada hasil"
                : "Belum ada konten"}
            </h3>
            <p className="v-empty-desc">
              {search || category !== "all"
                ? "Coba ubah kata kunci atau kategori"
                : "Konten Minecraft akan ditampilkan di sini setelah admin mengupload"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
