import dictionaries from "@cdp/lib/i18n/dictionaries/auth";
import { Locale } from "@cdp/lib/types";

import Button from "../Button";

export default function SignOutButton({
  locale,
  signOut,
  className,
}: {
  locale: Locale;
  signOut: () => Promise<void>;
  className?: string;
}) {
  const dictionary = dictionaries[locale];

  return (
    <form action={signOut}>
      <Button type="submit" variant="danger" className={className}>
        {dictionary.sign_out}
      </Button>
    </form>
  );
}
