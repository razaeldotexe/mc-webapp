import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { assembleChunks, saveThumbnail } from "@/lib/storage";
import { insertContent } from "@/lib/db";
import { getFileExtension } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadId = formData.get("uploadId") as string;
    const totalChunks = parseInt(formData.get("totalChunks") as string, 10);
    const originalFilename = formData.get("filename") as string;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const category = (formData.get("category") as string) || "mod";
    const fileSize = parseInt(formData.get("fileSize") as string, 10);
    const thumbnail = formData.get("thumbnail") as Blob | null;
    const supportedVersions =
      (formData.get("supportedVersions") as string) || "";
    const minecraftType = (formData.get("minecraftType") as string) || "";

    if (
      !uploadId ||
      isNaN(totalChunks) ||
      !originalFilename ||
      !title.trim() ||
      !description.trim() ||
      !thumbnail ||
      thumbnail.size === 0
    ) {
      return NextResponse.json(
        {
          error:
            "uploadId, totalChunks, filename, title, description, and thumbnail are required",
        },
        { status: 400 },
      );
    }

    const contentId = uuidv4();
    const ext = getFileExtension(originalFilename);
    const safeFilename = `${contentId}${ext}`;

    // Assemble chunks into final file
    const filePath = assembleChunks(uploadId, totalChunks, safeFilename);

    // Handle thumbnail
    let thumbnailPath = "";
    if (thumbnail && thumbnail.size > 0) {
      const thumbExt = getFileExtension(
        (formData.get("thumbnailName") as string) || "thumb.png",
      );
      const thumbFilename = `${contentId}${thumbExt}`;
      const thumbBuffer = Buffer.from(await thumbnail.arrayBuffer());
      thumbnailPath = saveThumbnail(thumbBuffer, thumbFilename);
    }

    // Save metadata to database
    insertContent({
      id: contentId,
      title,
      description,
      category,
      file_path: filePath,
      thumbnail_path: thumbnailPath,
      file_size: fileSize,
      extension: ext,
      supported_versions: supportedVersions,
      minecraft_type: minecraftType,
    });

    return NextResponse.json({
      success: true,
      content: {
        id: contentId,
        title,
        file_path: filePath,
        thumbnail_path: thumbnailPath,
      },
    });
  } catch (error) {
    console.error("Upload complete error:", error);
    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 },
    );
  }
}
