"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  FolderOpen,
  Settings,
  Box,
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
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
          <Box size={20} />
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
          <LogOut className="nav-icon" size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
