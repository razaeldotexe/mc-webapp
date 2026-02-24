import { NextResponse } from "next/server";
import { saveChunk } from "@/lib/storage";

// Allow large chunk uploads (5MB+)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadId = formData.get("uploadId") as string;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string, 10);
    const chunk = formData.get("chunk") as Blob;

    if (!uploadId || isNaN(chunkIndex) || !chunk) {
      return NextResponse.json(
        { error: "uploadId, chunkIndex, and chunk are required" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await chunk.arrayBuffer());
    saveChunk(uploadId, chunkIndex, buffer);

    return NextResponse.json({
      success: true,
      chunkIndex,
      message: `Chunk ${chunkIndex} saved`,
    });
  } catch (error) {
    console.error("Chunk upload error:", error);
    return NextResponse.json(
      { error: "Failed to save chunk" },
      { status: 500 },
    );
  }
}
