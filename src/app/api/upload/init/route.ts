import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { validateContentFile, getFileExtension } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename, fileSize } = body;

    if (!filename || fileSize === undefined) {
      return NextResponse.json(
        { error: "filename and fileSize are required" },
        { status: 400 },
      );
    }

    // Validate file
    const validation = validateContentFile(filename, fileSize);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const uploadId = uuidv4();
    const ext = getFileExtension(filename);

    return NextResponse.json({
      uploadId,
      extension: ext,
      message: "Upload initialized. Send chunks to /api/upload/chunk",
    });
  } catch (error) {
    console.error("Upload init error:", error);
    return NextResponse.json(
      { error: "Failed to initialize upload" },
      { status: 500 },
    );
  }
}
