"use client";

import { useEffect } from "react";

interface ThemeApplierProps {
  color: string;
  target: "admin" | "visitor";
}

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function adjustBrightness(hex: string, factor: number): string {
  const { r, g, b } = hexToRGB(hex);
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  return `rgb(${clamp(r * factor)}, ${clamp(g * factor)}, ${clamp(b * factor)})`;
}

export default function ThemeApplier({ color, target }: ThemeApplierProps) {
  useEffect(() => {
    if (!color) return;

    const root = document.documentElement;
    const { r, g, b } = hexToRGB(color);

    if (target === "admin") {
      // Core accent colors
      root.style.setProperty("--accent", color);
      root.style.setProperty("--accent-dark", adjustBrightness(color, 0.8));

      // Text and border accent
      root.style.setProperty("--text-accent", color);
      root.style.setProperty("--border-accent", `rgba(${r}, ${g}, ${b}, 0.3)`);

      // Glow effects
      root.style.setProperty("--accent-glow", `rgba(${r}, ${g}, ${b}, 0.15)`);
      root.style.setProperty(
        "--accent-glow-strong",
        `rgba(${r}, ${g}, ${b}, 0.3)`,
      );
    } else {
      // Visitor theme — set all visitor CSS variables
      root.style.setProperty("--v-accent", color);
      root.style.setProperty("--v-accent-dark", adjustBrightness(color, 0.75));
      root.style.setProperty("--v-accent-light", adjustBrightness(color, 1.3));
      root.style.setProperty("--v-accent-rgb", `${r}, ${g}, ${b}`);
    }
  }, [color, target]);

  return null;
}
