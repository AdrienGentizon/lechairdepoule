type Part = string | Record<string, unknown>;

export default class Trace {
  #operationName: string;
  #parts: Part[];
  #startedAt: number;

  constructor(operationName: string) {
    this.#operationName = operationName;
    this.#parts = [];
    this.#startedAt = Date.now();
  }

  push(part: Part | Part[]) {
    this.#parts = this.#parts.concat(part);
  }

  pushError(error: unknown) {
    this.#parts.push((error as Error)?.message, "unknown_error");
  }

  #tag(status: number) {
    return status < 400 ? `Operation` : `Error`;
  }

  #body() {
    return this.#parts
      .reduce((acc: string[], curr) => {
        acc.push(typeof curr === "string" ? curr : JSON.stringify(curr));
        return acc;
      }, [])
      .join(",");
  }

  log(status = 200) {
    const duration = Date.now() - this.#startedAt;
    const message = `[${this.#tag(status)}] ${this.#operationName} (${duration}ms) ${this.#body()}`;

    if (status < 400) return console.log(message);

    return console.error(message);
  }
}
