import Button from "@cdp/ui/Button";

import signOut from "@/actions/auth/signOut";
import { t } from "@/lib/i18n";

import dictionaries from "./dictionaries";

export default async function SignOutButton() {
  const dictionary = await t(dictionaries);

  return (
    <form action={signOut}>
      <Button type="submit" variant="danger">
        {dictionary.sign_out}
      </Button>
    </form>
  );
}
