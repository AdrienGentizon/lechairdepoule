import { after } from "next/server";

import { obfuscateEmail } from "./string";

type Part = string | Record<string, unknown>;

async function sendToLogsAPI(entry: Record<string, unknown>) {
  const url = process.env.LOGS_API_URL;
  const key = process.env.LOGS_API_KEY;
  if (!url || !key) return;

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([entry]),
  }).catch(() => undefined);
}

export default class Trace {
  #operationName: string;
  #request?: { method: string; path: string; query?: Record<string, string> };
  #parts: Part[];
  #startedAt: number;

  constructor(args: string | Request) {
    if (typeof args === "string") {
      this.#operationName = args;
    } else {
      const url = new URL(args.url);
      const query = Object.fromEntries(url.searchParams);
      this.#operationName = `${args.method} ${url.pathname}`;
      this.#request = {
        method: args.method,
        path: url.pathname,
        query: url.searchParams.size > 0 ? query : undefined,
      };
    }
    this.#parts = [];
    this.#startedAt = Date.now();
  }

  push(part: Part | Part[]) {
    this.#parts = this.#parts.concat(part);
  }

  pushError(error: unknown) {
    this.#parts.push(
      error instanceof Error
        ? { error: error.name, message: error.message }
        : { error: "unknown_error", message: String(error) },
    );
  }

  log(status = 200) {
    const isError = status >= 400;
    const entry = {
      level: isError ? "error" : "info",
      operation: this.#operationName,
      ...this.#request,
      status,
      durationMs: Date.now() - this.#startedAt,
      parts: this.#parts,
    };

    if (isError) console.error(JSON.stringify(entry));
    else console.log(JSON.stringify(entry));

    after(() => sendToLogsAPI(entry));
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toObfuscatedUser(user: any & { email?: string }) {
  if (!user.email || typeof user.email !== "string") return user;
  return {
    ...user,
    email: obfuscateEmail(user.email),
  };
}
