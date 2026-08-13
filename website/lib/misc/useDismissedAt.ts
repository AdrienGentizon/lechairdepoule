import { useState } from "react";

function getDismissedAt(key: string) {
  const storedDismissedAt = localStorage.getItem(key);
  if (!storedDismissedAt) return null;
  const dismissedAt = new Date(storedDismissedAt);
  if (isNaN(dismissedAt.getTime())) {
    localStorage.removeItem(key);
    return null;
  }
  return dismissedAt;
}

export default function useDismissedAt(key: string) {
  const [dismissedAt, setDismissedAt] = useState<Date | null>(() =>
    getDismissedAt(key)
  );

  const dismiss = () => {
    const now = new Date();
    localStorage.setItem(key, now.toISOString());
    setDismissedAt(now);
  };

  const reset = () => {
    localStorage.removeItem(key);
    setDismissedAt(null);
  };

  return { dismissedAt, dismiss, reset };
}
