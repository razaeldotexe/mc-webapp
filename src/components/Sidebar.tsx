"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  FolderOpen,
  Settings,
  Crown,
  Globe,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/upload", label: "Upload Konten", icon: Upload },
  { href: "/admin/contents", label: "Kelola Konten", icon: FolderOpen },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminIcon, setAdminIcon] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.admin_icon) {
          setAdminIcon(data.admin_icon);
        }
      })
      .catch((err) => console.error("Failed to load admin icon:", err));
  }, []);

  const handleLogout = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();

      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo animate-pulse-glow">
          <Crown size={20} />
        </div>
        <div>
          <div className="sidebar-title">ELFox</div>
          <div className="sidebar-subtitle">Admin Panel</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-title">Menu</span>
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <Icon className="nav-icon" size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <span className="sidebar-section-title" style={{ marginTop: "12px" }}>
          Lainnya
        </span>
        <Link href="/" className="nav-link" target="_blank">
          <Globe className="nav-icon" size={20} />
          <span>Lihat Halaman Publik</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="nav-link"
          style={{
            width: "100%",
            cursor: "pointer",
            border: "none",
            background: "transparent",
            color: "var(--danger)",
            fontFamily: "inherit",
          }}
        >
          {adminIcon ? (
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "4px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              className="nav-icon"
            >
              {adminIcon.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={adminIcon}
                  alt="Admin"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "14px", lineHeight: 1 }}>
                  {adminIcon}
                </span>
              )}
            </div>
          ) : (
            <LogOut className="nav-icon" size={20} />
          )}
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
