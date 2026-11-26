"use client";

import { useEffect } from "react";

export default function DetailsScrollIntoViewOnOpen({
  name,
}: {
  name: string;
}) {
  useEffect(() => {
    const abortController = new AbortController();

    document.addEventListener(
      "toggle",
      (event) => {
        const details = event.target;
        if (!(details instanceof HTMLDetailsElement)) return;
        if (details.name !== name || !details.open) return;

        details.scrollIntoView({ behavior: "smooth", block: "start" });
      },
      { capture: true, signal: abortController.signal },
    );

    return () => {
      abortController.abort();
    };
  }, [name]);

  return null;
}
