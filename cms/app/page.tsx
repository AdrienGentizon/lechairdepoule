import { t } from "@/lib/i18n";
import dictionaries from "@/lib/i18n/dictionaries/home";

export default async function Home() {
  const dictionary = await t(dictionaries);

  return (
    <main id="main" className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-thin uppercase">{dictionary.h1}</h1>
    </main>
  );
}
