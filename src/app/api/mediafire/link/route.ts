import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quickKey = searchParams.get("quickKey");

  if (!quickKey) {
    return NextResponse.json(
      { error: "Missing quickKey parameter" },
      { status: 400 },
    );
  }

  try {
    // When using public APIs for MediaFire, to get the direct download link
    // without a scraping library can be complex because mediafire generates it dynamically.
    // The easiest and most reliable method without authenticating is to just redirect
    // the user to the MediaFire download page for that file.
    // The user will see the MediaFire page and can click "Download".
    const viewUrl = `https://www.mediafire.com/file/${quickKey}`;
    return NextResponse.redirect(viewUrl);
  } catch (error: any) {
    console.error("MediaFire Link Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate MediaFire link" },
      { status: 500 },
    );
  }
}
