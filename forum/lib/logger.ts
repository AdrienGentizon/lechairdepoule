export function getLogger(operation: string, prefix = "Operation") {
  const start = Date.now();
  const payload: string[] = [];
  const timestamp = () => {
    const ms = Date.now() - start;
    return ms < 1000
      ? `(${ms}ms) - ${new Date().toISOString()}`
      : `(${(ms / 1000).toFixed(1)}s) - ${new Date().toISOString()}`;
  };

  return {
    append(item: string | object) {
      payload.push(typeof item === "string" ? item : JSON.stringify(item));
    },
    withError(error: string | Error | unknown) {
      return {
        flush() {
          console.error(
            [
              `[Error]`,
              operation,
              `(${timestamp()})`,
              payload.join(", "),
              typeof error === "string"
                ? error
                : ((error as Error)?.message ?? JSON.stringify(error)),
            ]
              .filter((str) => str.length > 0)
              .join(" ")
          );
        },
      };
    },
    flush() {
      console.log(
        [`[${prefix}]`, operation, timestamp(), payload.join(", ")]
          .filter((str) => str.length > 0)
          .join(" ")
      );
    },
  };
}
