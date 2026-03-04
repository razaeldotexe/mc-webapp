import { NextResponse } from "next/server";
import { fetchMediaFireFiles } from "@/lib/mediafire";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderKey = searchParams.get("folderKey");

  if (!folderKey) {
    return NextResponse.json(
      { error: "Missing folderKey parameter" },
      { status: 400 },
    );
  }

  try {
    const files = await fetchMediaFireFiles(folderKey);
    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("MediaFire Files Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch MediaFire files" },
      { status: 500 },
    );
  }
}
