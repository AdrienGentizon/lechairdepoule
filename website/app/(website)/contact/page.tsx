import Markdown from "react-markdown";

import { notFound } from "next/navigation";

import ContactForm from "@/components/ContactForm/ContactForm";
import ChairDePoule from "@/components/png/ChairDePoule";
import PeinePerdue from "@/components/png/PeinePerdue";
import { DANGEROUS_FALLBACK_TZ, LOCALE, getValidDate } from "@/lib/date";
import getContactPage, {
  ContactPage as ContactPageType,
} from "@/queries/getContactPage";

const METADATA = {
  CDP: {
    title: "Le Chair de Poule",
    icon: ChairDePoule,
  },
  PP: {
    title: "Le Peine Perdue",
    icon: PeinePerdue,
  },
};

function getPauseData(data: ContactPageType) {
  const startsAt = data.pauseStartsAt
    ? getValidDate(data.pauseStartsAt)
    : undefined;
  const endsAt = data.pauseEndsAt ? getValidDate(data.pauseEndsAt) : undefined;
  const message =
    data.pauseMessage ??
    `C'est la pause, mais la réouverture ne saurait tarder...`;
  const now = new Date();

  if (!startsAt || now.getTime() < startsAt.getTime()) return;
  if (endsAt && now.getTime() >= endsAt.getTime()) return;

  return {
    startsAt,
    endsAt,
    message,
  };
}

function OpeningHours({
  variant,
  data,
}: {
  variant: "CDP" | "PP";
  data: ContactPageType;
}) {
  const pauseData = getPauseData(data);

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <h2>
        <span className="sr-only">{METADATA[variant].title}</span>
        {METADATA[variant].icon({ className: "w-24" })}
      </h2>
      <div className="flex flex-col justify-center text-center font-mono landscape:min-h-40">
        <Markdown>{pauseData ? pauseData.message : data.openingHours}</Markdown>
        {pauseData && pauseData.endsAt && (
          <p>{`Réouverture le ${pauseData.endsAt.toLocaleDateString(LOCALE, { timeZone: DANGEROUS_FALLBACK_TZ })}`}</p>
        )}
      </div>
    </div>
  );
}

export default async function ContactPage() {
  const contactCDP = await getContactPage("CDP");
  const contactPP = await getContactPage("PP");
  if (!contactCDP || !contactPP) return notFound();

  return (
    <div className="flex flex-col items-center justify-center gap-4 bg-black landscape:gap-8">
      <h1 className="sr-only">Contacts</h1>
      <div className="flex flex-col items-center justify-center">
        <h2 className="sr-only">Adresse</h2>
        <div className="font-mono">
          <Markdown>{contactCDP.contactNumbers}</Markdown>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 landscape:grid-cols-2 landscape:gap-x-16">
        <OpeningHours variant="CDP" data={contactCDP} />
        <OpeningHours variant="PP" data={contactPP} />
      </div>
      <ContactForm />
    </div>
  );
}
