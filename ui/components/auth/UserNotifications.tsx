import { ReactNode } from "react";

import dictionaries from "@cdp/lib/i18n/dictionaries/auth";
import { Locale } from "@cdp/lib/types";

export default function UserNotifications({
  locale,
  unread,
  children,
}: {
  locale: Locale;
  unread: number;
  children: ReactNode;
}) {
  const dictionary = dictionaries[locale];

  return (
    <span className="relative inline-flex">
      {children}
      <span className="sr-only" aria-live="polite">
        {`${unread} ${dictionary.unread_notifications}`}
      </span>
      {unread > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 flex size-3 items-center justify-center rounded-full bg-red-500 font-mono text-[0.5rem] text-white"
          aria-hidden
        >
          {unread}
        </span>
      )}
    </span>
  );
}
