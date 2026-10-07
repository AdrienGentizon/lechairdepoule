import SignInForm from "@/components/auth/SignInForm";
import { t } from "@/lib/i18n";
import dictionaries from "@/lib/i18n/dictionaries/auth";

export default async function LoginPage() {
  const dictionary = await t(dictionaries);

  return (
    <main
      id="main"
      className="grid w-full grid-cols-1 grid-rows-[auto_1fr] place-items-center"
    >
      <h1 className="py-4 text-2xl font-thin uppercase">{dictionary.h1}</h1>
      <SignInForm className="h-full w-full max-w-sm justify-center" />
    </main>
  );
}
