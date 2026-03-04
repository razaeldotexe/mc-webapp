import { NextResponse } from "next/server";
import { fetchMediaFireFolder } from "@/lib/mediafire";

export async function GET() {
  try {
    // MediaFire no longer allows easy email/password authentication via third-party libraries.
    // Instead, the user needs to provide their root "public folder key" in .env
    const rootFolderKey = process.env.MEDIAFIRE_ROOT_FOLDER_KEY;

    if (!rootFolderKey) {
      return NextResponse.json(
        { error: "Please provide MEDIAFIRE_ROOT_FOLDER_KEY in .env" },
        { status: 400 },
      );
    }

    const folders = await fetchMediaFireFolder(rootFolderKey);
    return NextResponse.json({ folders });
  } catch (error: any) {
    console.error("MediaFire Folders Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch MediaFire folders" },
      { status: 500 },
    );
  }
}
