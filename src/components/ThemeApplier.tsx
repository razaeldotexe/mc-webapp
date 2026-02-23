"use client";

import { useEffect } from "react";

interface ThemeApplierProps {
  color: string;
  target: "admin" | "visitor";
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return { h: h * 360, s, l };
}

export default function ThemeApplier({ color, target }: ThemeApplierProps) {
  useEffect(() => {
    if (!color) return;

    const root = document.documentElement;

    if (target === "admin") {
      root.style.setProperty("--accent", color);
      root.style.setProperty("--accent-dark", color);
      const hsl = hexToHSL(color);
      root.style.setProperty(
        "--accent-glow",
        `hsla(${hsl.h}, ${hsl.s * 100}%, ${hsl.l * 100}%, 0.15)`,
      );
      root.style.setProperty(
        "--accent-glow-strong",
        `hsla(${hsl.h}, ${hsl.s * 100}%, ${hsl.l * 100}%, 0.3)`,
      );
    } else {
      // Visitor theme — update CSS custom properties used in visitor styles
      root.style.setProperty("--v-accent", color);
    }
  }, [color, target]);

  return null;
}
