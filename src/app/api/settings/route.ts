import { NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/db";
import { updateAdminPassword, updateAdminUsername } from "@/lib/auth";

export async function GET() {
  try {
    const maxStorage = getSetting("max_storage_bytes") || "1099511627776";
    const adminName = getSetting("admin_username") || "razael";
    const adminIcon = getSetting("admin_icon") || "";
    const adminTheme = getSetting("admin_theme_color") || "#22c55e";
    const visitorTheme = getSetting("visitor_theme_color") || "#3b82f6";

    return NextResponse.json({
      max_storage_bytes: parseInt(maxStorage, 10),
      admin_name: adminName,
      admin_icon: adminIcon,
      admin_theme_color: adminTheme,
      visitor_theme_color: visitorTheme,
    });
  } catch (error) {
    console.error("Failed to get settings:", error);
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (body.max_storage_bytes !== undefined) {
      setSetting("max_storage_bytes", String(body.max_storage_bytes));
    }

    if (body.admin_name !== undefined && body.admin_name.trim()) {
      updateAdminUsername(body.admin_name.trim());
    }

    if (body.admin_password !== undefined && body.admin_password.trim()) {
      updateAdminPassword(body.admin_password.trim());
    }

    if (body.admin_icon !== undefined) {
      setSetting("admin_icon", body.admin_icon);
    }

    if (body.admin_theme_color !== undefined) {
      setSetting("admin_theme_color", body.admin_theme_color);
    }

    if (body.visitor_theme_color !== undefined) {
      setSetting("visitor_theme_color", body.visitor_theme_color);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
