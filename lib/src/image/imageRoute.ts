import CustomError from "@cdp/lib/CustomError";
import { selectObject } from "@cdp/lib/s3";
import Trace from "@cdp/lib/trace";

const PUBLIC_KEY_PREFIXES = ["organizations/", "files/", "legacy/"];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const trace = new Trace(req);
  try {
    const key = (await params).key.join("/");
    if (!PUBLIC_KEY_PREFIXES.some((prefix) => key.startsWith(prefix)))
      return new Response(null, { status: 404 });

    const object = await selectObject({ key });
    if (!object) return new Response(null, { status: 404 });

    return new Response(object.body, {
      headers: {
        "Content-Type": object.contentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return CustomError.toResponse(error, trace);
  }
}
