import { z } from "zod";

const WHITESPACE_AND_NEWLINE_REGEX = /(\s+)/;

function isUrl(token: string): boolean {
  return z.string().url().startsWith("https://").safeParse(token).success;
}

export default function TextParser({ text }: { text: string }) {
  const parts = text.split(WHITESPACE_AND_NEWLINE_REGEX);

  return (
    <>
      {parts.map((part, n) => {
        if (isUrl(part)) {
          return (
            <a
              key={n}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline hover:text-blue-300"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
}
