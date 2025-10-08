import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth/jwt";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/forum")) {
    return NextResponse.next();
  }

  if (process.env["VERCEL_ENV"] === "production") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const { id } = await verifyToken((await cookies()).get("token")?.value);

    if (!id) return NextResponse.redirect(new URL("/sign-in", request.url));
  } catch (error) {
    console.error(
      `[ERROR] middleware: ${(error as Error)?.message ?? "unknown error"}`,
    );
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!api/|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
