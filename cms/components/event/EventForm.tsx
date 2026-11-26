"use client";

import {
  CircleNotchIcon,
  FloppyDiskBackIcon,
  ImageIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import { useState } from "react";

import z from "zod";

import { Event } from "@cdp/lib/types";
import Button, { buttonClassName } from "@cdp/ui/Button";
import {
  ErrorMessage,
  HintOrErrorMessage,
  Input,
  InputField,
  Label,
} from "@cdp/ui/Form";
import UploadFileButton from "@cdp/ui/UploadFileButton";
import cn from "@cdp/ui/cn";

import { EventInput, EventInputSchema, frErrorMap } from "@/lib/validation";

const EVENT_TYPE_LABELS = {
  EVENT: { startDate: "Date de début", submit: "Créer l'événement" },
  RELEASE: { startDate: "Date de sortie", submit: "Créer la sortie" },
} satisfies Record<Event["type"], { startDate: string; submit: string }>;

function toNullableString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : null;
}

export default function EventForm({
  eventType,
  defaultValue,
  tosHref,
  isPending,
  error,
  onSubmit,
}: {
  eventType: Event["type"];
  defaultValue?: Event;
  tosHref: string;
  isPending: boolean;
  error?: Error | null;
  onSubmit: (
    inputs: Omit<EventInput, "cover">,
    cover:
      | { action: "KEEP" }
      | { action: "REMOVE" }
      | { action: "REPLACE"; file: File },
  ) => void;
}) {
  const isUpdate = defaultValue !== undefined;

  const [cover, setCover] = useState<
    | { action: "KEEP" }
    | { action: "REMOVE" }
    | { action: "REPLACE"; file: File; previewUrl: string }
  >({ action: "KEEP" });
  const coverPreviewUrl =
    cover.action === "REPLACE"
      ? cover.previewUrl
      : cover.action === "KEEP"
        ? defaultValue?.imageUrl
        : null;
  const [errors, setErrors] = useState<
    Partial<Record<keyof EventInput | "tos", string[]>>
  >({});

  const resetError = (key: keyof EventInput | "tos") =>
    setErrors((prev) => ({ ...prev, [key]: undefined }));

  return (
    <form
      className="grid grid-cols-1 grid-rows-[minmax(0,1fr)_auto]"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isPending) return;

        const formData = new FormData(e.currentTarget);
        const tosAccepted = isUpdate || formData.get("tos") === "on";
        const endDate = toNullableString(formData.get("endDate"));

        const parsedInputs = EventInputSchema.omit({ cover: true }).safeParse(
          {
            type: eventType,
            title: toNullableString(formData.get("title")) ?? "",
            description: toNullableString(formData.get("description")) ?? "",
            startDate: toNullableString(formData.get("startDate")) ?? "",
            startTime: toNullableString(formData.get("startTime")),
            endDate,
            endTime: endDate ? toNullableString(formData.get("endTime")) : null,
            timezone:
              defaultValue?.timezone ??
              Intl.DateTimeFormat().resolvedOptions().timeZone,
            price: toNullableString(formData.get("price")),
            venue: toNullableString(formData.get("venue")),
            url: toNullableString(formData.get("url")),
          },
          { error: frErrorMap },
        );

        if (!parsedInputs.success || !tosAccepted) {
          return setErrors({
            ...(parsedInputs.success
              ? {}
              : z.flattenError(parsedInputs.error).fieldErrors),
            tos: tosAccepted ? undefined : ["requis"],
          });
        }

        onSubmit(
          parsedInputs.data,
          cover.action === "REPLACE"
            ? { action: "REPLACE", file: cover.file }
            : cover,
        );
      }}
    >
      <div className="relative flex flex-col overflow-y-auto pr-1">
        <InputField
          label="Titre"
          hint="100 caractères max."
          id="title"
          name="title"
          required
          autoFocus={!isUpdate}
          defaultValue={defaultValue?.title}
          errors={errors.title}
          onResetError={() => resetError("title")}
        />

        <div className="flex flex-col">
          <Label htmlFor="description">
            Description<span aria-hidden>*</span>
          </Label>
          <textarea
            id="description"
            name="description"
            required
            defaultValue={defaultValue?.description ?? ""}
            aria-describedby="hints--description errors--description"
            aria-invalid={(errors.description ?? []).length > 0}
            onChange={() => resetError("description")}
            className="font-courier border-foreground bg-background min-h-20 w-full min-w-0 rounded-sm border px-2 py-1"
          />
          <HintOrErrorMessage
            id="description"
            hint="500 caractères max."
            errors={errors.description ?? []}
          />
        </div>

        <div
          className={cn(
            "grid grid-cols-1 gap-4",
            eventType === "EVENT" && "sm:grid-cols-2",
          )}
        >
          <div className="flex flex-col">
            <Label htmlFor="startDate">
              {EVENT_TYPE_LABELS[eventType].startDate}
              <span aria-hidden>*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                defaultValue={defaultValue?.startDate ?? ""}
                aria-describedby="hints--startDate errors--startDate"
                aria-invalid={(errors.startDate ?? []).length > 0}
                onChange={() => resetError("startDate")}
              />
              {eventType === "EVENT" && (
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  defaultValue={defaultValue?.startTime ?? ""}
                  aria-label="Heure de début"
                  aria-invalid={(errors.startTime ?? []).length > 0}
                  onChange={() => resetError("startTime")}
                />
              )}
            </div>
            <HintOrErrorMessage
              id="startDate"
              errors={[
                ...(errors.startDate ?? []),
                ...(errors.startTime ?? []),
              ]}
            />
          </div>

          {eventType === "EVENT" && (
            <div className="flex flex-col">
              <Label htmlFor="endDate">Date de fin</Label>
              <div className="flex gap-2">
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={defaultValue?.endDate ?? ""}
                  aria-describedby="hints--endDate errors--endDate"
                  aria-invalid={(errors.endDate ?? []).length > 0}
                  onChange={() => resetError("endDate")}
                />
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  defaultValue={defaultValue?.endTime ?? ""}
                  aria-label="Heure de fin"
                  aria-invalid={(errors.endTime ?? []).length > 0}
                  onChange={() => resetError("endTime")}
                />
              </div>
              <HintOrErrorMessage
                id="endDate"
                errors={[...(errors.endDate ?? []), ...(errors.endTime ?? [])]}
              />
            </div>
          )}
        </div>

        {eventType === "EVENT" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
            <InputField
              label="Tarif(s)"
              id="price"
              name="price"
              defaultValue={defaultValue?.price ?? ""}
              errors={errors.price}
              onResetError={() => resetError("price")}
            />
            <InputField
              label="Lieu"
              id="venue"
              name="venue"
              defaultValue={defaultValue?.venue ?? ""}
              errors={errors.venue}
              onResetError={() => resetError("venue")}
            />
          </div>
        )}

        <InputField
          label="Lien"
          hint="billeterie, site internet..."
          id="url"
          name="url"
          type="url"
          placeholder="https://"
          defaultValue={defaultValue?.url ?? ""}
          errors={errors.url}
          onResetError={() => resetError("url")}
        />

        <div className="flex flex-col gap-2 pb-4">
          <span className="text-sm font-black leading-loose">
            Photo de couverture
          </span>
          {coverPreviewUrl ? (
            <div className="grid grid-cols-[1fr_auto] items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                src={coverPreviewUrl}
                className="h-auto max-h-64 w-full rounded-sm bg-neutral-900 object-contain"
              />
              <button
                type="button"
                className="cursor-pointer"
                onClick={() => {
                  if (cover.action === "REPLACE")
                    URL.revokeObjectURL(cover.previewUrl);
                  setCover({ action: "REMOVE" });
                }}
              >
                <TrashIcon size={20} aria-hidden className="text-red-500" />
                <span className="sr-only">Retirer la photo de couverture</span>
              </button>
            </div>
          ) : (
            <UploadFileButton
              className={buttonClassName({ variant: "secondary" })}
              isPending={isPending}
              uploadFile={(file) => {
                setCover({
                  action: "REPLACE",
                  file,
                  previewUrl: URL.createObjectURL(file),
                });
              }}
            >
              <ImageIcon size={18} aria-hidden />
              Sélectionner une image
            </UploadFileButton>
          )}
        </div>
      </div>

      <footer className="flex flex-col gap-2 pt-4">
        {!isUpdate && (
          <div className="flex items-center gap-2">
            <input
              id="tos"
              name="tos"
              type="checkbox"
              className="accent-purple-300"
              aria-invalid={(errors.tos ?? []).length > 0}
              onChange={() => resetError("tos")}
            />
            <label
              htmlFor="tos"
              className={cn("text-sm", errors.tos && "text-red-400")}
            >
              Je m&apos;engage à respecter les{" "}
              <a
                href={tosHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 underline transition-colors hover:text-purple-400"
              >
                règles
              </a>{" "}
              de publication
            </label>
          </div>
        )}
        <Button type="submit" aria-disabled={isPending}>
          {isPending ? (
            <CircleNotchIcon
              size={18}
              aria-hidden
              className="motion-safe:animate-spin"
            />
          ) : (
            <FloppyDiskBackIcon size={18} aria-hidden />
          )}
          {isUpdate ? "Enregistrer" : EVENT_TYPE_LABELS[eventType].submit}
        </Button>
        <p role="status" className="sr-only">
          {isPending ? "Enregistrement en cours" : ""}
        </p>
        {error && <ErrorMessage role="alert">{error.message}</ErrorMessage>}
      </footer>
    </form>
  );
}
