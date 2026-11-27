"use client";

import { QuestionIcon } from "@phosphor-icons/react";

import { ComponentProps, useState } from "react";

import dictionaries from "@cdp/lib/i18n/dictionaries/userReport";
import { Locale } from "@cdp/lib/types";
import { UserReportInput, UserReportInputSchema } from "@cdp/lib/validation";

import cn from "../lib/cn";
import Button from "./Button";
import Dialog from "./Dialog";
import { ErrorMessage, Label } from "./Form";

const USER_REPORT_TYPES = ["BUG", "QUESTION", "FEATURE"] as const;

export function UserReportTrigger({
  locale,
  className,
  ...props
}: Omit<ComponentProps<"button">, "children"> & { locale: Locale }) {
  const dictionary = dictionaries[locale];

  return (
    <button
      type="button"
      className={cn(
        "scale-100 cursor-pointer rounded-full border-transparent transition-all hover:scale-110 hover:border-purple-400 hover:bg-purple-900 landscape:border-2",
        className,
      )}
      {...props}
    >
      <QuestionIcon
        aria-hidden
        className="bg-background size-8 rounded-full text-purple-300"
      />
      <span className="sr-only">{dictionary.contact_us}</span>
    </button>
  );
}

function UserReportForm({
  locale,
  isPending,
  error,
  onSubmit,
}: {
  locale: Locale;
  isPending: boolean;
  error: Error | null;
  onSubmit: (inputs: UserReportInput, onSuccess: () => void) => void;
}) {
  const dictionary = dictionaries[locale];
  const [bodyError, setBodyError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="rounded-sm border border-green-400 bg-green-950 px-2 py-1 text-green-400">
        {dictionary.submitted}
      </p>
    );
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (isPending) return;
        setBodyError(undefined);

        const formData = new FormData(e.currentTarget);
        const parsed = UserReportInputSchema.safeParse({
          type: formData.get("type"),
          body: formData.get("body"),
          pageUrl: window.location.href,
        });
        if (!parsed.success) return setBodyError(dictionary.body_error);

        onSubmit(parsed.data, () => setSubmitted(true));
      }}
    >
      <fieldset className="flex flex-col gap-1">
        <legend className="sr-only">{dictionary.type_legend}</legend>
        {USER_REPORT_TYPES.map((type) => (
          <div key={type} className="flex items-center gap-2">
            <input
              id={`user-report-${type}`}
              name="type"
              value={type}
              type="radio"
              className="cursor-pointer"
              defaultChecked={type === "BUG"}
            />
            <Label htmlFor={`user-report-${type}`} className="cursor-pointer">
              {dictionary.types[type]}
            </Label>
          </div>
        ))}
      </fieldset>
      <div className="flex flex-col">
        <Label htmlFor="user-report-body">
          {dictionary.message_label}
          <span aria-hidden>*</span>
        </Label>
        <textarea
          id="user-report-body"
          name="body"
          required
          aria-invalid={!!bodyError}
          aria-describedby="errors--user-report-body"
          onChange={() => setBodyError(undefined)}
          className="font-courier min-h-20 w-full rounded-sm border border-neutral-300 bg-neutral-950 px-2 py-1"
        />
        <ErrorMessage id="errors--user-report-body" role="alert">
          {bodyError ?? <>&nbsp;</>}
        </ErrorMessage>
      </div>
      <Button type="submit" aria-disabled={isPending} className="self-end">
        {dictionary.submit}
      </Button>
      {error && (
        <ErrorMessage role="alert" className="text-center">
          {error.message || dictionary.unknown_error}
        </ErrorMessage>
      )}
    </form>
  );
}

export default function UserReportButton({
  locale,
  isPending,
  error,
  onSubmit,
}: {
  locale: Locale;
  isPending: boolean;
  error: Error | null;
  onSubmit: (inputs: UserReportInput, onSuccess: () => void) => void;
}) {
  const dictionary = dictionaries[locale];

  return (
    <Dialog>
      <Dialog.Trigger render={<UserReportTrigger locale={locale} />} />
      <Dialog.Content>
        <Dialog.Title>{dictionary.contact_us}</Dialog.Title>
        <Dialog.Description className="sr-only">
          {dictionary.description}
        </Dialog.Description>
        <UserReportForm
          locale={locale}
          isPending={isPending}
          error={error}
          onSubmit={onSubmit}
        />
      </Dialog.Content>
    </Dialog>
  );
}
