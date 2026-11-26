"use client";

import { Locale } from "@cdp/lib/types";
import SharedUserButton from "@cdp/ui/auth/UserButton";

import useMe from "@/components/auth/useMe";

export default function UserButton({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const { me, isFetching, error } = useMe();

  return (
    <SharedUserButton
      locale={locale}
      me={me}
      isFetching={isFetching}
      error={error}
      className={className}
    />
  );
}
