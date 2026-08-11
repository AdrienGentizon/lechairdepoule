"use client";

import { useEffect } from "react";

export default function ScrollIntoView() {
  useEffect(() => {
    const abortController = new AbortController();

    document.addEventListener(
      "toggle",
      (e) => {
        const details = e.target;
        if (!(details instanceof HTMLDetailsElement)) return;
        if (details.name !== "events" || !details.open) return;

        details.scrollIntoView({ behavior: "smooth", block: "start" });
      },
      { capture: true, signal: abortController.signal }
    );

    return () => {
      abortController.abort();
    };
  }, []);

  return null;
}
