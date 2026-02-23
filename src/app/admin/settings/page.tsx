'use client';

import { useEffect, useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import StorageBar from '@/components/StorageBar';
import { formatFileSize } from '@/lib/validation';

export default function SettingsPage() {
    const [maxStorageGB, setMaxStorageGB] = useState('1024');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [storageUsed, setStorageUsed] = useState(0);
    const [storageTotal, setStorageTotal] = useState(0);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const [settingsRes, storageRes] = await Promise.all([
                fetch('/api/settings'),
                fetch('/api/storage'),
            ]);

            if (settingsRes.ok) {
                const data = await settingsRes.json();
                const gb = Math.round(data.max_storage_bytes / (1024 * 1024 * 1024));
                setMaxStorageGB(String(gb));
                setStorageTotal(data.max_storage_bytes);
            }

            if (storageRes.ok) {
                const data = await storageRes.json();
                setStorageUsed(data.used);
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);

        try {
            const bytes = parseInt(maxStorageGB, 10) * 1024 * 1024 * 1024;

            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ max_storage_bytes: bytes }),
            });

            if (res.ok) {
                setSaved(true);
                setStorageTotal(bytes);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (err) {
            console.error('Failed to save settings:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-muted)' }}>
                Memuat pengaturan...
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Pengaturan</h1>
                <p className="page-description">Konfigurasi platform konten Minecraft</p>
            </div>

            {saved && (
                <div className="notification notification-success">
                    <CheckCircle size={18} />
                    <span>Pengaturan berhasil disimpan!</span>
                </div>
            )}

            <div className="settings-section">
                {/* Storage Configuration */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="settings-group" style={{ borderBottom: 'none', paddingTop: 0, paddingBottom: 0 }}>
                        <div className="settings-group-title">Kapasitas Storage</div>
                        <div className="settings-group-desc">
                            Atur total kapasitas storage yang dialokasikan untuk platform ini.
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <StorageBar used={storageUsed} total={storageTotal} />
                        </div>

                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">Kapasitas Maksimum (GB)</label>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <input
                                    className="form-input"
                                    type="number"
                                    min="1"
                                    max="10240"
                                    value={maxStorageGB}
                                    onChange={(e) => setMaxStorageGB(e.target.value)}
                                    style={{ width: '200px' }}
                                />
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    = {formatFileSize(parseInt(maxStorageGB || '0', 10) * 1024 * 1024 * 1024)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Presets */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="settings-group" style={{ borderBottom: 'none', paddingTop: 0, paddingBottom: 0 }}>
                        <div className="settings-group-title">Preset Cepat</div>
                        <div className="settings-group-desc">Pilih preset kapasitas yang umum digunakan.</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {[100, 256, 512, 1024, 2048].map((gb) => (
                                <button
                                    key={gb}
                                    className={`btn ${maxStorageGB === String(gb) ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                    onClick={() => setMaxStorageGB(String(gb))}
                                >
                                    {gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="settings-group" style={{ borderBottom: 'none', paddingTop: 0, paddingBottom: 0 }}>
                        <div className="settings-group-title">Informasi Sistem</div>
                        <div className="settings-group-desc">Detail teknis platform.</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Versi Platform</span>
                                <span style={{ fontWeight: 600 }}>1.0.0</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Database</span>
                                <span style={{ fontWeight: 600 }}>SQLite (better-sqlite3)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Storage</span>
                                <span style={{ fontWeight: 600 }}>Local / S3-ready</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Max Upload</span>
                                <span style={{ fontWeight: 600 }}>5 GB per file</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Format yang Didukung</span>
                                <span style={{ fontWeight: 600 }}>.mcpack, .zip, .mcworld, .mcaddon, .mctemplate, .tar</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    <Save size={16} />
                    {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
            </div>
        </div>
    );
}
