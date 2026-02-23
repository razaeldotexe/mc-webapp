import { NextResponse } from "next/server";
import { getContentById, deleteContent, incrementVisitCount } from "@/lib/db";
import { deleteFile } from "@/lib/storage";

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

    // Increment visit count for this view
    incrementVisitCount(id);

    // Fetch updated content to return latest stats
    const updatedContent = getContentById(id);

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error("Failed to get content:", error);
    return NextResponse.json(
      { error: "Failed to get content" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const content = getContentById(id);

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Delete file from storage
    if (content.file_path) {
      deleteFile(content.file_path);
    }

    // Delete thumbnail
    if (content.thumbnail_path) {
      deleteFile(content.thumbnail_path);
    }

    // Delete from database
    deleteContent(id);

    return NextResponse.json({ success: true, message: "Content deleted" });
  } catch (error) {
    console.error("Failed to delete content:", error);
    return NextResponse.json(
      { error: "Failed to delete content" },
      { status: 500 },
    );
  }
}
