"use client";

import sendEmail from "@/actions/sendEmail";
import { cn } from "@/lib/utils";
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

export default function ConctactPage() {
  const router = useRouter();
  const [actionResult, setActionResult] = useState<
    { status: number; message: string } | undefined
  >(undefined);

  return (
    <>
      <form
        action={async (formData) => {
          const actionResult = await sendEmail(undefined, formData);
          setActionResult(actionResult);
          if (actionResult.status === 200)
            setTimeout(() => {
              router.push(`/`);
            }, 500);
        }}
        className="flex flex-col gap-4"
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
    </>
  );
}
