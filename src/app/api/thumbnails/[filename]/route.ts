import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params;

    // Sanitize filename to prevent directory traversal
    const safeName = path.basename(filename);
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "thumbnails",
      safeName,
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Thumbnail not found" },
        { status: 404 },
      );
    }

    const ext = path.extname(safeName).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileBuffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Thumbnail serve error:", error);
    return NextResponse.json(
      { error: "Failed to serve thumbnail" },
      { status: 500 },
    );
  }
}
