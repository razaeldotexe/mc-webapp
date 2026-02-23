"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileSidebarToggle from "@/components/MobileSidebarToggle";
import ThemeApplier from "@/components/ThemeApplier";

export default function AdminLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminTheme, setAdminTheme] = useState("");

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Fetch admin theme color
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.admin_theme_color) setAdminTheme(d.admin_theme_color);
      })
      .catch(() => {});
  }, []);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className={`app-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
      {adminTheme && <ThemeApplier color={adminTheme} target="admin" />}
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar />
      <main className="main-content">
        <div className="mobile-header">
          <MobileSidebarToggle
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div className="mobile-header-title">Admin Dashboard</div>
        </div>
        {children}
      </main>
    </div>
  );
}
