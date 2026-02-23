"use client";

import { useEffect, useState } from "react";
import {
  Save,
  CheckCircle,
  User,
  Palette,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import StorageBar from "@/components/StorageBar";
import { formatFileSize } from "@/lib/validation";

const THEME_PRESETS = [
  { label: "Hijau", value: "#22c55e" },
  { label: "Biru", value: "#3b82f6" },
  { label: "Ungu", value: "#8b5cf6" },
  { label: "Merah", value: "#ef4444" },
  { label: "Oranye", value: "#f97316" },
  { label: "Pink", value: "#ec4899" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Gold", value: "#eab308" },
];

export default function SettingsPage() {
  const [maxStorageGB, setMaxStorageGB] = useState("1024");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageTotal, setStorageTotal] = useState(0);

  // Admin account
  const [adminName, setAdminName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminIcon, setAdminIcon] = useState("");

  // Theme
  const [adminTheme, setAdminTheme] = useState("#22c55e");
  const [visitorTheme, setVisitorTheme] = useState("#3b82f6");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [settingsRes, storageRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/storage"),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        const gb = Math.round(data.max_storage_bytes / (1024 * 1024 * 1024));
        setMaxStorageGB(String(gb));
        setStorageTotal(data.max_storage_bytes);
        setAdminName(data.admin_name || "");
        setAdminIcon(data.admin_icon || "");
        setAdminTheme(data.admin_theme_color || "#22c55e");
        setVisitorTheme(data.visitor_theme_color || "#3b82f6");
      }

      if (storageRes.ok) {
        const data = await storageRes.json();
        setStorageUsed(data.used);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const bytes = parseInt(maxStorageGB, 10) * 1024 * 1024 * 1024;

      const payload: Record<string, unknown> = {
        max_storage_bytes: bytes,
        admin_name: adminName,
        admin_icon: adminIcon,
        admin_theme_color: adminTheme,
        visitor_theme_color: visitorTheme,
      };

      // Only send password if user typed a new one
      if (newPassword.trim()) {
        payload.admin_password = newPassword.trim();
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaved(true);
        setStorageTotal(bytes);
        setNewPassword("");
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "50vh",
          color: "var(--text-muted)",
        }}
      >
        Memuat pengaturan...
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Pengaturan</h1>
        <p className="page-description">
          Konfigurasi akun admin, tema, dan platform
        </p>
      </div>

      {saved && (
        <div className="notification notification-success">
          <CheckCircle size={18} />
          <span>Pengaturan berhasil disimpan!</span>
        </div>
      )}

      <div className="settings-section">
        {/* Admin Account */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <div
            className="settings-group"
            style={{ borderBottom: "none", paddingTop: 0, paddingBottom: 0 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "4px",
              }}
            >
              <User size={18} style={{ color: "var(--accent)" }} />
              <div className="settings-group-title" style={{ marginBottom: 0 }}>
                Akun Admin
              </div>
            </div>
            <div className="settings-group-desc">
              Ubah nama, password, dan ikon akun administrator.
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginTop: "16px",
              }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nama Admin</label>
                <input
                  className="form-input"
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Username admin"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password Baru</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="form-input"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak ingin ganti"
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      padding: "4px",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div
              className="form-group"
              style={{ marginTop: "16px", marginBottom: 0 }}
            >
              <label className="form-label">
                Icon Akun (URL gambar atau emoji)
              </label>
              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <input
                  className="form-input"
                  type="text"
                  value={adminIcon}
                  onChange={(e) => setAdminIcon(e.target.value)}
                  placeholder="https://example.com/avatar.png atau 🎮"
                  style={{ flex: 1 }}
                />
                {adminIcon && (
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {adminIcon.startsWith("http") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={adminIcon}
                        alt="Icon"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "22px" }}>{adminIcon}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Theme Colors */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <div
            className="settings-group"
            style={{ borderBottom: "none", paddingTop: 0, paddingBottom: 0 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "4px",
              }}
            >
              <Palette size={18} style={{ color: "var(--accent)" }} />
              <div className="settings-group-title" style={{ marginBottom: 0 }}>
                Tema Warna
              </div>
            </div>
            <div className="settings-group-desc">
              Atur warna aksen untuk dashboard admin dan visitor.
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginTop: "16px",
              }}
            >
              {/* Admin Theme */}
              <div>
                <label className="form-label">Warna Admin Dashboard</label>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "12px",
                  }}
                >
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setAdminTheme(preset.value)}
                      title={preset.label}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: preset.value,
                        border:
                          adminTheme === preset.value
                            ? "3px solid #fff"
                            : "2px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        boxShadow:
                          adminTheme === preset.value
                            ? `0 0 12px ${preset.value}60`
                            : "none",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="color"
                    value={adminTheme}
                    onChange={(e) => setAdminTheme(e.target.value)}
                    style={{
                      width: "40px",
                      height: "32px",
                      border: "none",
                      cursor: "pointer",
                      background: "none",
                    }}
                  />
                  <input
                    className="form-input"
                    type="text"
                    value={adminTheme}
                    onChange={(e) => setAdminTheme(e.target.value)}
                    style={{ width: "120px" }}
                  />
                  <div
                    style={{
                      width: "80px",
                      height: "32px",
                      borderRadius: "8px",
                      background: adminTheme,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                </div>
              </div>

              {/* Visitor Theme */}
              <div>
                <label className="form-label">Warna Visitor Dashboard</label>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "12px",
                  }}
                >
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setVisitorTheme(preset.value)}
                      title={preset.label}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: preset.value,
                        border:
                          visitorTheme === preset.value
                            ? "3px solid #fff"
                            : "2px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        boxShadow:
                          visitorTheme === preset.value
                            ? `0 0 12px ${preset.value}60`
                            : "none",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="color"
                    value={visitorTheme}
                    onChange={(e) => setVisitorTheme(e.target.value)}
                    style={{
                      width: "40px",
                      height: "32px",
                      border: "none",
                      cursor: "pointer",
                      background: "none",
                    }}
                  />
                  <input
                    className="form-input"
                    type="text"
                    value={visitorTheme}
                    onChange={(e) => setVisitorTheme(e.target.value)}
                    style={{ width: "120px" }}
                  />
                  <div
                    style={{
                      width: "80px",
                      height: "32px",
                      borderRadius: "8px",
                      background: visitorTheme,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Configuration */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <div
            className="settings-group"
            style={{ borderBottom: "none", paddingTop: 0, paddingBottom: 0 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "4px",
              }}
            >
              <Key size={18} style={{ color: "var(--accent)" }} />
              <div className="settings-group-title" style={{ marginBottom: 0 }}>
                Kapasitas Storage
              </div>
            </div>
            <div className="settings-group-desc">
              Atur total kapasitas storage yang dialokasikan untuk platform ini.
            </div>

            <div style={{ marginBottom: "20px", marginTop: "16px" }}>
              <StorageBar used={storageUsed} total={storageTotal} />
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">Kapasitas Maksimum (GB)</label>
              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  max="10240"
                  value={maxStorageGB}
                  onChange={(e) => setMaxStorageGB(e.target.value)}
                  style={{ width: "200px" }}
                />
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  ={" "}
                  {formatFileSize(
                    parseInt(maxStorageGB || "0", 10) * 1024 * 1024 * 1024,
                  )}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[100, 256, 512, 1024, 2048].map((gb) => (
                <button
                  key={gb}
                  className={`btn ${maxStorageGB === String(gb) ? "btn-primary" : "btn-secondary"} btn-sm`}
                  onClick={() => setMaxStorageGB(String(gb))}
                >
                  {gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <div
            className="settings-group"
            style={{ borderBottom: "none", paddingTop: 0, paddingBottom: 0 }}
          >
            <div className="settings-group-title">Informasi Sistem</div>
            <div className="settings-group-desc">Detail teknis platform.</div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "13px",
              }}
            >
              {[
                ["Versi Platform", "1.0.0"],
                ["Database", "SQLite (better-sqlite3)"],
                ["Storage", "Local / S3-ready"],
                ["Max Upload", "5 GB per file"],
                [
                  "Format yang Didukung",
                  ".mcpack, .zip, .mcworld, .mcaddon, .mctemplate, .tar",
                ],
              ].map(([label, val], i, arr) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom:
                      i < arr.length - 1
                        ? "1px solid var(--border-subtle)"
                        : "none",
                  }}
                >
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{val}</span>
                </div>
              ))}
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
          {saving ? "Menyimpan..." : "Simpan Semua Pengaturan"}
        </button>
      </div>
    </div>
  );
}
