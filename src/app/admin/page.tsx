'use client';

import { useEffect, useState } from 'react';
import { HardDrive, FileArchive, FolderOpen, TrendingUp } from 'lucide-react';
import StorageBar from '@/components/StorageBar';
import ContentCard from '@/components/ContentCard';
import { formatFileSize } from '@/lib/validation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StorageData {
  used: number;
  total: number;
  percentage: number;
  contentCount: number;
  byCategory: { category: string; count: number; total_size: number }[];
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  file_path: string;
  thumbnail_path: string;
  file_size: number;
  extension: string;
  created_at: string;
}

const CHART_COLORS = ['#4ade80', '#60a5fa', '#fbbf24', '#f472b6', '#a78bfa', '#2dd4bf', '#94a3b8'];

export default function DashboardPage() {
  const [storage, setStorage] = useState<StorageData | null>(null);
  const [recentContents, setRecentContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [storageRes, contentsRes] = await Promise.all([
        fetch('/api/storage'),
        fetch('/api/contents'),
      ]);

      if (storageRes.ok) {
        setStorage(await storageRes.json());
      }

      if (contentsRes.ok) {
        const data = await contentsRes.json();
        setRecentContents(data.contents.slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus konten ini?')) return;
    try {
      const res = await fetch(`/api/contents/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <HardDrive size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <div>Memuat dashboard...</div>
        </div>
      </div>
    );
  }

  const categoryData = storage?.byCategory?.map((cat) => ({
    name: cat.category,
    value: cat.count,
    size: cat.total_size,
  })) || [];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Ringkasan dan monitoring platform konten Minecraft</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="card card-glow">
          <div className="card-header">
            <div>
              <div className="card-title">Storage Terpakai</div>
              <div className="card-value">{formatFileSize(storage?.used || 0)}</div>
              <div className="card-subtitle">dari {formatFileSize(storage?.total || 0)}</div>
            </div>
            <div className="card-icon green">
              <HardDrive size={22} />
            </div>
          </div>
          <StorageBar
            used={storage?.used || 0}
            total={storage?.total || 1}
            showLabel={false}
          />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Total Konten</div>
              <div className="card-value">{storage?.contentCount || 0}</div>
              <div className="card-subtitle">file terkelola</div>
            </div>
            <div className="card-icon blue">
              <FileArchive size={22} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Kategori</div>
              <div className="card-value">{storage?.byCategory?.length || 0}</div>
              <div className="card-subtitle">tipe konten</div>
            </div>
            <div className="card-icon amber">
              <FolderOpen size={22} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Penggunaan</div>
              <div className="card-value">{storage?.percentage || 0}%</div>
              <div className="card-subtitle">kapasitas storage</div>
            </div>
            <div className="card-icon green">
              <TrendingUp size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Storage Warning */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '16px' }}>Distribusi Konten per Kategori</div>
          {categoryData.length > 0 ? (
            <div className="chart-container" style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any, name: any) => [
                      `${value} file`,
                      name,
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Belum ada data konten
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: '16px' }}>Detail Storage</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <StorageBar used={storage?.used || 0} total={storage?.total || 1} />

            {(storage?.percentage || 0) >= 80 && (
              <div className="notification notification-warning" style={{ marginBottom: 0 }}>
                ⚠️ Storage hampir penuh! ({storage?.percentage}% terpakai)
              </div>
            )}

            {storage?.byCategory?.map((cat) => (
              <div key={cat.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge badge-${cat.category}`}>{cat.category}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{cat.count} file</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatFileSize(cat.total_size)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Uploads */}
      <div style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Upload Terbaru</h2>
          {recentContents.length > 0 && (
            <a href="/admin/contents" className="btn btn-secondary btn-sm">Lihat Semua</a>
          )}
        </div>

        {recentContents.length > 0 ? (
          <div className="content-grid">
            {recentContents.map((content) => (
              <ContentCard
                key={content.id}
                id={content.id}
                title={content.title}
                description={content.description}
                category={content.category}
                thumbnailPath={content.thumbnail_path}
                fileSize={content.file_size}
                extension={content.extension}
                createdAt={content.created_at}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileArchive size={28} />
            </div>
            <div className="empty-state-title">Belum ada konten</div>
            <div className="empty-state-desc">Mulai upload konten Minecraft pertamamu</div>
            <a href="/admin/upload" className="btn btn-primary">Upload Sekarang</a>
          </div>
        )}
      </div>
    </div>
  );
}
