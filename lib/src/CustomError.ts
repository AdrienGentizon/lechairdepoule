import dictionaries from "./i18n/dictionaries/errors";
import Trace from "./trace";
import { ErrorKeys, Locale } from "./types";

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

function fillPlaceholders(message: string, params: Record<string, string>) {
  return message
    .replace(PLACEHOLDER_PATTERN, (_, name: string) => params[name] ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

type CustomErrorWithParams = {
  error: ErrorKeys;
  params?: Record<string, string>;
};

function isErrorKey(error: unknown): error is ErrorKeys {
  return typeof error === "string" && Object.hasOwn(dictionaries.fr, error);
}

export default class CustomError extends Error {
  readonly key: ErrorKeys;
  readonly params: Record<string, string>;
  readonly status: number;

  constructor(
    key: ErrorKeys = "unknown_error",
    params: Record<string, string> = {},
    status = 500,
    locale: Locale = "fr",
  ) {
    const message = CustomError.toLocaleString(key, params, locale);
    super(message);
    this.name = key;
    this.key = key;
    this.params = params;
    this.status = status;
  }

  static from(error: unknown) {
    if (error instanceof CustomError) return error;
    if (isErrorKey(error)) return new CustomError(error);

    const customError = new CustomError(
      error instanceof Error ? "server_error" : "unknown_error",
    );
    customError.cause = error;
    return customError;
  }

  static toResponse(error: unknown, trace: Trace) {
    const customError = CustomError.from(error);
    trace.pushError(error);
    trace.log(customError.status);
    return Response.json(customError, { status: customError.status });
  }

  toJSON() {
    return {
      error: this.key,
      params: this.params,
    } satisfies CustomErrorWithParams;
  }

  static #isCustomErrorWithParams(
    unknownError: unknown,
  ): unknownError is CustomErrorWithParams {
    return (
      isErrorKey((unknownError as CustomErrorWithParams)?.error) &&
      typeof (unknownError as CustomErrorWithParams).params === "object"
    );
  }

  static async fromResponse(response: Response) {
    try {
      const result = (await response.json()) as CustomErrorWithParams;
      if (!CustomError.#isCustomErrorWithParams(result))
        throw new CustomError("unknown_error");
      return new CustomError(result.error, result.params, response.status);
    } catch {
      return new CustomError("unknown_error", {}, response.status);
    }
  }

  static toLocaleString(
    key: ErrorKeys,
    params: Record<string, string> = {},
    locale: Locale = "fr",
  ) {
    const message = dictionaries[locale][key];
    return fillPlaceholders(message, params);
  }
}
