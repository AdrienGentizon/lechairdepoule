import { redirect } from "next/navigation";

import MarkdownRenderer from "@/components/MarkDownRenderer/MarkDownRenderer";
import { fetchEntryGraphQL } from "@/lib/contentful";
import { TermsOfService } from "@/lib/types";

async function getCGU() {
  try {
    const response = await fetchEntryGraphQL<TermsOfService>(
      "termsOfService",
      `query {
      termsOfService(id: "1E0kx1tfqDqlgkyRS3H0to") {
      sys {
        id
        }
      cgu
      }
    }`
    );
    if (!response?.data) return;
    return response.data.termsOfService.cgu as TermsOfService["cgu"];
  } catch (error) {
    console.error(error);
    return;
  }
}

export default async function TermsOfServicePage() {
  const cgu = await getCGU();

  if (!cgu) return redirect("/");

  return (
    <section aria-labelledby="cgu">
      <h2 id="cgu" className="pb-1 pt-4 text-lg font-semibold">
        Conditions générales d'utilisation
      </h2>
      <MarkdownRenderer content={cgu} className="p-2" />
    </section>
  );
}
