import dictionaries from "@cdp/lib/i18n/dictionaries/pages";

import SignInForm from "@/components/auth/SignInForm";
import { t } from "@/lib/i18n";

export default async function LoginPage() {
  const dictionary = await t(dictionaries);

  return (
    <main
      id="main"
      className="grid w-full grid-cols-1 grid-rows-[auto_1fr] place-items-center"
    >
      <h1 className="py-4 text-2xl font-thin uppercase">
        {dictionary.log_in_h1}
      </h1>
      <SignInForm className="h-full w-full max-w-sm justify-center" />
    </main>
  );
}
