"use client";

import { Menu, X } from "lucide-react";

interface MobileSidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MobileSidebarToggle({
  isOpen,
  onToggle,
}: MobileSidebarToggleProps) {
  return (
    <button
      className="mobile-sidebar-toggle"
      onClick={onToggle}
      aria-label={isOpen ? "Tutup menu" : "Buka menu"}
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
}
