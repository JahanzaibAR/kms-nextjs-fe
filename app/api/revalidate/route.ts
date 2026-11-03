import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Strapi webhook target: POST /api/revalidate?secret=XXX
// Refreshes all pages that read from Strapi (cacheTag "strapi") on publish/save.
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, message: "Invalid secret" }, { status: 401 });
  }
  revalidateTag("strapi", { expire: 0 });
  return NextResponse.json({ ok: true, revalidated: true, at: Date.now() });
}
