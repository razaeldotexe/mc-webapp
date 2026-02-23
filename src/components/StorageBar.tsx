"use client";

import { formatFileSize } from "@/lib/validation";

interface StorageBarProps {
  used: number;
  total: number;
  showLabel?: boolean;
}

export default function StorageBar({
  used,
  total,
  showLabel = true,
}: StorageBarProps) {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const fillClass =
    percentage >= 90 ? "danger" : percentage >= 70 ? "warning" : "";

  return (
    <div className="storage-bar-wrapper">
      {showLabel && (
        <div className="storage-bar-header">
          <span className="storage-bar-label">Penggunaan Storage</span>
          <span className="storage-bar-value">
            {formatFileSize(used)} / {formatFileSize(total)} (
            {percentage.toFixed(1)}%)
          </span>
        </div>
      )}
      <div className="storage-bar-track">
        <div
          className={`storage-bar-fill ${fillClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
