import { UserCircleIcon } from "@phosphor-icons/react";

import { ReactNode } from "react";

import Link from "next/link";

import dictionaries from "@cdp/lib/i18n/dictionaries/auth";
import { Locale } from "@cdp/lib/types";

import cn from "../../lib/cn";

export function UserIcon() {
  return <UserCircleIcon aria-hidden className="size-8" />;
}

function UnknownUserPlaceholder({ className }: { className?: string }) {
  return (
    <span className={className}>
      <UserCircleIcon
        aria-hidden
        className="bg-background size-8 rounded-full text-purple-300 opacity-50"
      />
    </span>
  );
}

function LogInLink({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const dictionary = dictionaries[locale];

  return (
    <Link
      href={`/log-in`}
      className={cn(
        "scale-100 cursor-pointer rounded-full border-transparent transition-all hover:scale-110 hover:border-purple-400 hover:bg-purple-900 landscape:border-2",
        className,
      )}
    >
      <UserCircleIcon
        aria-hidden
        className="bg-background size-8 rounded-full text-purple-300"
      />
      <span className="sr-only">{dictionary.sign_in}</span>
    </Link>
  );
}

function ProfileLink({
  locale,
  className,
  children,
}: {
  locale: Locale;
  className?: string;
  children: ReactNode;
}) {
  const dictionary = dictionaries[locale];

  return (
    <Link
      href={`/profile`}
      className={cn(
        "text-foreground flex cursor-pointer hover:text-purple-300",
        className,
      )}
    >
      {children}
      <span className="sr-only">{dictionary.my_profile}</span>
    </Link>
  );
}

export default function UserButton({
  locale,
  me,
  isFetching,
  error,
  className,
  children = <UserIcon />,
}: {
  locale: Locale;
  me: { id: string } | null | undefined;
  isFetching: boolean;
  error: Error | null;
  className?: string;
  children?: ReactNode;
}) {
  if (isFetching) return null;
  if (!me && error) return <UnknownUserPlaceholder className={className} />;
  if (!me) return <LogInLink locale={locale} className={className} />;

  return (
    <ProfileLink locale={locale} className={className}>
      {children}
    </ProfileLink>
  );
}
