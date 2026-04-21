import { useState } from "react";

import { Loader, Trash2 } from "lucide-react";
import Image from "next/image";

import Button, { buttonClassName } from "../Button/Button";
import Form, { FieldError, FormField, Input, Label } from "../Form/Form";
import { cn } from "@/lib/utils";

const CONVERSATION_TYPE_SPECIFICATIONS = {
  TOPIC: { cover: false, startsAt: false, endsAt: false },
  EVENT: { cover: true, startsAt: true, endsAt: true },
  RELEASE: { cover: true, startsAt: true, endsAt: false },
};

function getDateTimeAsInputValue(date?: Date): { date: string; time: string } {
  if (!date) return { date: "", time: "" };
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
}

function getDateTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr || "00:00"}`);
}

export type ConversationFormValues = {
  title: string;
  description: string;
  startsAt?: Date;
  endsAt?: Date;
  cover?: File;
};

type Props = {
  conversationType: "TOPIC" | "EVENT" | "RELEASE";
  initialValues?: {
    title?: string;
    description?: string;
    startsAt?: Date;
    endsAt?: Date;
  };
  onSubmit: (values: ConversationFormValues) => void;
  isPending: boolean;
  error?: Error | null;
  coverUrl?: string;
  onDeleteCover?: () => void;
  submitLabel: string;
};

export default function CreateTopicForm({
  conversationType = "TOPIC",
  initialValues,
  onSubmit,
  isPending,
  error,
  coverUrl,
  onDeleteCover,
  submitLabel,
}: Props) {
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [form, setForm] = useState<{
    title?: string;
    description?: string;
    startsAt?: Date;
    endsAt?: Date;
  }>({
    title: initialValues?.title,
    description: initialValues?.description,
    startsAt: initialValues?.startsAt,
    endsAt: initialValues?.endsAt,
  });
  const [coverFile, setCoverFile] = useState<File | undefined>(undefined);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    rules?: string;
  }>({});
  const [previewSrc, setPreviewSrc] = useState<string | undefined>(undefined);

  const conversationSpecifications =
    CONVERSATION_TYPE_SPECIFICATIONS[conversationType];

  return (
    <Form
      id="conversation-form"
      className="overflow-y-scroll"
      onChange={(e) => {
        if (!(e.target instanceof HTMLInputElement) || e.target.type !== "file")
          return;
        const file = e.target.files?.[0];
        if (!file || file.size === 0) return;
        setCoverFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === "string")
            setPreviewSrc(e.target.result);
        };
        reader.readAsDataURL(file);
      }}
      onSubmit={(e) => {
        e.preventDefault();
        setErrors({});

        const title = form.title ?? "";
        const description = form.description ?? "";
        const rulesNotAccepted = !initialValues && !rulesAccepted;

        if (!title || !description || rulesNotAccepted)
          return setErrors({
            title: !title ? "Titre obligatoire" : undefined,
            description: !description ? "Description obligatoire" : undefined,
            rules: rulesNotAccepted
              ? "Veuillez accepter les règles du forum"
              : undefined,
          });

        onSubmit({
          title,
          description,
          startsAt: form.startsAt,
          endsAt: form.endsAt,
          cover: coverFile,
        });
      }}
    >
      <FormField>
        <Label htmlFor="title" aria-required>
          Titre
        </Label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          autoFocus
          value={form.title ?? ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
        />
        <FieldError>{errors.title}</FieldError>
      </FormField>
      <FormField>
        <Label htmlFor="description" aria-required>
          Description
        </Label>
        <Input
          id="description"
          name="description"
          type="text"
          required
          value={form.description ?? ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        <FieldError>{errors.description}</FieldError>
      </FormField>
      {conversationSpecifications.startsAt && (
        <FormField>
          <Label htmlFor="startsAtDate">
            {conversationType === "EVENT" ? "Date de début" : "Date de sortie"}
          </Label>
          <div className="flex gap-2">
            <Input
              id="startsAtDate"
              type="date"
              value={getDateTimeAsInputValue(form.startsAt).date}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  startsAt: getDateTime(
                    e.target.value,
                    getDateTimeAsInputValue(prev.startsAt).time
                  ),
                }))
              }
            />
            {conversationType === "EVENT" && (
              <Input
                id="startsAtTime"
                type="time"
                disabled={!form.startsAt}
                value={getDateTimeAsInputValue(form.startsAt).time}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    startsAt: getDateTime(
                      getDateTimeAsInputValue(prev.startsAt).date,
                      e.target.value
                    ),
                  }))
                }
              />
            )}
          </div>
          <FieldError>{null}</FieldError>
        </FormField>
      )}
      {conversationSpecifications.endsAt && (
        <FormField>
          <Label htmlFor="endsAtDate">Date de fin</Label>
          <div className="flex gap-2">
            <Input
              id="endsAtDate"
              type="date"
              value={getDateTimeAsInputValue(form.endsAt).date}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  endsAt: getDateTime(
                    e.target.value,
                    getDateTimeAsInputValue(prev.endsAt).time
                  ),
                }))
              }
            />
            <Input
              id="endsAtTime"
              type="time"
              disabled={!form.endsAt}
              value={getDateTimeAsInputValue(form.endsAt).time}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  endsAt: getDateTime(
                    getDateTimeAsInputValue(prev.endsAt).date,
                    e.target.value
                  ),
                }))
              }
            />
          </div>
          <FieldError>{null}</FieldError>
        </FormField>
      )}
      {conversationSpecifications.cover && (
        <FormField>
          <Label htmlFor="file">Photo de couverture</Label>
          {coverUrl && onDeleteCover && (
            <button
              type="button"
              disabled={isPending}
              onClick={onDeleteCover}
              className="group mb-2 grid cursor-pointer grid-cols-[5rem_1fr] rounded-sm border border-gray-800 transition-colors hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="relative size-20">
                <Image
                  alt=""
                  src={coverUrl}
                  fill
                  sizes="80px"
                  className="rounded-l-sm object-cover"
                />
              </div>
              <div className="inline-flex items-center justify-center gap-2 rounded-r-sm bg-gray-800 transition-colors group-hover:text-red-400">
                <Trash2 aria-hidden className="size-4" />
                Supprimer
              </div>
            </button>
          )}
          <label htmlFor="file" className={buttonClassName("w-full")}>
            Sélectionner un fichier...
          </label>
          <Input
            id="file"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
          />
          {previewSrc && (
            <Image
              alt=""
              aria-hidden
              src={previewSrc}
              width={0}
              height={0}
              sizes="(max-width: 640px) 390px, 512px"
              className="max-h-96 w-full object-contain py-2"
              style={{ height: "auto" }}
            />
          )}
          <FieldError>{null}</FieldError>
        </FormField>
      )}
      {!initialValues && (
        <div className="flex items-center gap-2 py-2">
          <input
            id="rules-acceptance"
            type="checkbox"
            checked={rulesAccepted}
            onChange={(e) => setRulesAccepted(e.target.checked)}
          />
          <label
            htmlFor="rules-acceptance"
            className={cn("text-sm", errors.rules && "text-red-500")}
          >
            Je m&apos;engage à respecter les règles du forum
          </label>
        </div>
      )}
      <Button form="conversation-form" type="submit" className="mt-9 w-full">
        {submitLabel}
        {isPending && <Loader className="size-4 animate-spin" />}
      </Button>
      {error && (
        <FieldError className="mt-2 rounded-sm border border-red-500 bg-red-500/15 px-2 text-center">
          {error.message ??
            "Erreur inconnue, veuillez réessayer ou nous signaler un bug."}
        </FieldError>
      )}
    </Form>
  );
}
