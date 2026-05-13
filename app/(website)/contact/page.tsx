import Markdown from "react-markdown";

import { notFound } from "next/navigation";

import ContactForm from "@/components/ContactForm/ContactForm";
import ChairDePoule from "@/components/png/ChairDePoule";
import PeinePerdue from "@/components/png/PeinePerdue";
import getContactPage from "@/queries/getContactPage";

export default async function ContactPage() {
  const contactPage = await getContactPage();
  if (!contactPage) return notFound();

  return (
    <div className="flex flex-col items-center justify-center gap-4 bg-black">
      <h1 className="sr-only">Contacts</h1>
      <div className="flex flex-col items-center justify-center pt-4 sm:pt-8 sm:pb-4">
        <h2 className="sr-only">Adresse</h2>
        <div className="font-mono">
          <Markdown>{contactPage.contactNumbers}</Markdown>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-x-16">
        <div className="flex flex-col items-center justify-center p-2">
          <h2>
            <span className="sr-only">Le Chair de Poule</span>
            <ChairDePoule className="w-24" />
          </h2>
          <div className="font-mono">
            <Markdown>{contactPage.chairdepouleOpeningHours}</Markdown>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-2">
          <h2>
            <span className="sr-only">Le Peine Perdue</span>
            <PeinePerdue className="w-24" />
          </h2>
          <div className="font-mono">
            <Markdown>{contactPage.peineperdueOpeningHours}</Markdown>
          </div>
        </div>
      </div>
      <ContactForm />
    </div>
  );
}
