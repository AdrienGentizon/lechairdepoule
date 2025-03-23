"use client";

import sendEmail from "@/actions/sendEmail";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitMessageButton() {
  const { pending } = useFormStatus();
  return (
    <button
      aria-disabled={pending}
      className="rounded border border-white py-2 font-extralight"
      type="submit"
    >
      Envoyer
    </button>
  );
}

export default function ContactForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [actionResult, setActionResult] = useState<
    { status: number; message: string } | undefined
  >(undefined);

  return (
    <>
      <button
        className={cn(
          "font-extralight underline",
          open && "ml-auto pr-4 no-underline sm:pr-0",
        )}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? (
          <>
            <span className="sr-only">Fermer le formulaire</span>
            <X className="size-5 sm:size-4" />
          </>
        ) : (
          <>Envoyer un message ?</>
        )}
      </button>
      {open && (
        <form
          className="flex w-full flex-col gap-4 px-4 sm:px-0"
          action={async (formData) => {
            const actionResult = await sendEmail(undefined, formData);
            setActionResult(actionResult);
            if (actionResult.status === 200)
              setTimeout(() => {
                router.push(`/`);
              }, 2000);
          }}
        >
          <fieldset className="flex flex-col gap-2">
            <label htmlFor="email" className="font-sm font-semibold">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nanani@nanana.com"
              className="rounded p-2 font-mono text-black"
              required
            />
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <label htmlFor="subject" className="font-sm font-semibold">
              Objet
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              defaultValue={`Demande d'informations`}
              className="rounded p-2 font-mono text-black"
            />
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <label htmlFor="message" className="font-sm font-semibold">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              className="min-h-56 resize-none rounded p-2 font-mono text-black"
              placeholder="Nanani nanana..."
              required
            />
          </fieldset>
          <SubmitMessageButton />
          {actionResult && (
            <p
              className={cn(
                "text-center font-light text-green-400",
                actionResult.status > 200 && "text-red-400",
              )}
            >
              {actionResult.message}
            </p>
          )}
        </form>
      )}
    </>
  );
}
