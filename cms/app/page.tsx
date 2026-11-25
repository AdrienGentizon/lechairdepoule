import dictionaries from "@cdp/lib/i18n/dictionaries/pages";

import HomePage from "@/components/pages/HomePage";
import { t } from "@/lib/i18n";

export default async function Home() {
  const dictionary = await t(dictionaries);

  return (
    <>
      <h1 className="sr-only">{dictionary.home_h1}</h1>
      <HomePage />
    </>
  );
}
