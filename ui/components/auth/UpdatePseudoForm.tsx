"use client";

import { ArrowsClockwiseIcon } from "@phosphor-icons/react";

import { useState, useTransition } from "react";

import z from "zod";

import dictionaries from "@cdp/lib/i18n/dictionaries/auth";
import { toErrorMessage } from "@cdp/lib/i18n/utils";
import { Locale, Result } from "@cdp/lib/types";

import cn from "../../lib/cn";
import Button from "../Button";
import { InputField } from "../Form";

export default function UpdatePseudoForm({
  locale,
  defaultPseudo,
  updatePseudo,
  className,
}: {
  locale: Locale;
  defaultPseudo: string | null;
  updatePseudo: (inputs: { pseudo: string }) => Promise<Result<null>>;
  className?: string;
}) {
  const dictionary = dictionaries[locale];
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{
    pseudo?: string[];
    submit?: string[];
  }>({});

  const submit = (form: HTMLFormElement) => {
    if (isPending) return;

    const parsedInputs = z
      .object({ pseudo: z.string().trim().min(3).max(50) })
      .safeParse(Object.fromEntries(new FormData(form).entries()), {
        error: z.locales[locale]().localeError,
      });

    if (!parsedInputs.success) {
      return setErrors(z.flattenError(parsedInputs.error).fieldErrors);
    }

    startTransition(async () => {
      const response = await updatePseudo({
        pseudo: parsedInputs.data.pseudo,
      });

      if (!response.success) {
        return setErrors({ submit: [toErrorMessage(response.error, locale)] });
      }

      setErrors({});
    });
  };

  return (
    <form
      className={cn("flex flex-col", className)}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        submit(e.currentTarget);
      }}
    >
      <InputField
        key={defaultPseudo}
        label={dictionary.pseudo_label}
        id="pseudo"
        name="pseudo"
        autoComplete="off"
        required
        defaultValue={defaultPseudo ?? ""}
        errors={[errors.submit, errors.pseudo].flat()}
        onResetError={() => setErrors({})}
      />

      <Button type="submit" className="ml-auto" aria-disabled={isPending}>
        {isPending && (
          <ArrowsClockwiseIcon
            className="motion-safe:animate-spin"
            aria-hidden
          />
        )}
        {dictionary.update}
      </Button>
      <p role="status" className="sr-only">
        {isPending ? dictionary.updating : ""}
      </p>
    </form>
  );
}
