import dictionaries from "@cdp/lib/i18n/dictionaries/pages";

import { t } from "@/lib/i18n";

export default async function Home() {
  const dictionary = await t(dictionaries);

  return (
    <main id="main" className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-thin uppercase">{dictionary.home_h1}</h1>
    </main>
  );
}
