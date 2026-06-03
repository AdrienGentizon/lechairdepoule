import { fetchEntryGraphQL } from "@/lib/contentful";

export type ContactPage = {
  sys: { id: string };
  pageTitle: string;
  messageDeLaPatronne: string;
  chairdepouleOpeningHours: string;
  peineperdueOpeningHours: string;
  contactNumbers: string;
};

export default async function getContactPage() {
  return (
    await fetchEntryGraphQL<ContactPage>(
      "contact",
      `query {
      contact(id: "s7FASABDHFgqVs10Nb02Z") {
      sys {
        id
        }
      messageDeLaPatronne
      chairdepouleOpeningHours
      peineperdueOpeningHours
      contactNumbers
      }
    }`
    )
  )?.data?.contact;
}
