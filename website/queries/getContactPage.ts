import { fetchEntryGraphQL } from "@/lib/contentful";

export type ContactPage = {
  sys: { id: string };
  pageTitle: string;
  description: string;
  openingHours: string;
  contactNumbers: string;
  pauseMessage?: string;
  pauseStartsAt?: string;
  pauseEndsAt?: string;
};

const IDS = {
  CDP: "s7FASABDHFgqVs10Nb02Z",
  PP: "6LvuhqG588tmge2jbpXBM7",
};

export default async function getContactPage(key: "CDP" | "PP") {
  return (
    await fetchEntryGraphQL<ContactPage>(
      "contact",
      `query {
      contact(id: "${IDS[key]}") {
      sys {
        id
        }
      description
      openingHours
      contactNumbers
      pauseMessage
      pauseStartsAt
      pauseEndsAt
      }
    }`
    )
  )?.data?.contact;
}
