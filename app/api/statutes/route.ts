// The statute library is private. This endpoint is intentionally disabled.
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response("Not found", { status: 404 });
}
