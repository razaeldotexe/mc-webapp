import { NextResponse } from "next/server";
import { getContentById, incrementDownloadCount } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const content = getContentById(id);

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const fullPath = path.join(process.cwd(), "public", content.file_path);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: "File not found on disk" },
        { status: 404 },
      );
    }

    incrementDownloadCount(id);

    const stat = fs.statSync(fullPath);
    const fileStream = fs.readFileSync(fullPath);

    const headers = new Headers();
    headers.set("Content-Type", "application/octet-stream");
    headers.set("Content-Length", String(stat.size));
    headers.set(
      "Content-Disposition",
      `attachment; filename="${content.title}${content.extension}"`,
    );

    return new NextResponse(fileStream, { status: 200, headers });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
