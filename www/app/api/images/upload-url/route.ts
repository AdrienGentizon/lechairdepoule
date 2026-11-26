import { NextRequest, NextResponse } from "next/server";

import CustomError from "@cdp/lib/CustomError";
import { ImageUploadInputSchema } from "@cdp/lib/file";
import { signUploadUrl, toUserObjectKey } from "@cdp/lib/s3";
import Trace from "@cdp/lib/trace";
import { ImageUploadUrl } from "@cdp/lib/types";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import getLoggableUser from "@/lib/auth/getLoggableUser";

export async function POST(req: NextRequest) {
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) throw new CustomError("unauthorized", {}, 401);
    trace.push(getLoggableUser(user));

    const payload = await req.json();
    const parsedInputs = ImageUploadInputSchema.safeParse(payload);
    if (!parsedInputs.success) {
      trace.push([{ payload }, parsedInputs.error.message]);
      throw new CustomError("bad_request", {}, 400);
    }

    const objectKey = toUserObjectKey(user.id);
    const url = await signUploadUrl({
      key: objectKey,
      contentType: parsedInputs.data.contentType,
      size: parsedInputs.data.size,
    });

    trace.push({ objectKey });
    trace.log();
    return NextResponse.json<ImageUploadUrl>(
      { objectKey, url },
      { status: 200 },
    );
  } catch (error) {
    return CustomError.toResponse(error, trace);
  }
}
