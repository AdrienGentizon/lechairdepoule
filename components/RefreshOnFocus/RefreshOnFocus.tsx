"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

export default function RefreshOnFocus() {
  const router = useRouter();

  useEffect(() => {
    const abortController = new AbortController();

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.visibilityState === "visible") router.refresh();
      },
      {
        signal: abortController.signal,
      }
    );

    return () => {
      abortController.abort();
    };
  }, [router]);

  return null;
}
