import { useState } from "react";

import { Loader, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ConversationFormSchema } from "@/lib/schemas";
import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

import Button, { buttonClassName } from "../Button/Button";
import AugmentedTextarea from "../ChatRoom/SubmitMessageForm/AugmentedTextarea/AugmentedTextarea";
import Form, {
  FieldError,
  FormField,
  Input,
  Label,
  inputClassName,
} from "../Form/Form";

const CONVERSATION_TYPE_SPECIFICATIONS: Record<
  NonNullable<Conversation["type"]>,
  {
    cover: boolean;
    startsAt: boolean;
    endsAt: boolean;
    price: boolean;
    venue: boolean;
    url: boolean;
    closableToContributions: boolean;
  }
> = {
  TOPIC: {
    cover: false,
    startsAt: false,
    endsAt: false,
    price: false,
    venue: false,
    url: false,
    closableToContributions: false,
  },
  EVENT: {
    cover: true,
    startsAt: true,
    endsAt: true,
    price: true,
    venue: true,
    url: true,
    closableToContributions: true,
  },
  RELEASE: {
    cover: true,
    startsAt: true,
    endsAt: false,
    price: false,
    venue: true,
    url: true,
    closableToContributions: true,
  },
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
  startsAt?: string | null;
  endsAt?: string | null;
  price?: string | null;
  venue?: string | null;
  url?: string | null;
  cover?: File;
  closedToContributionsAt?: string | null;
};

type Props = {
  conversationType: NonNullable<Conversation["type"]>;
  initialValues?: {
    title?: string;
    description?: string;
    startsAt?: Date;
    endsAt?: Date;
    price?: string | null;
    venue?: string | null;
    url?: string | null;
    closedToContributionsAt?: Date | null;
  };
  onSubmit: (values: ConversationFormValues) => void;
  isPending: boolean;
  error?: Error | null;
  coverUrl?: string;
  onDeleteCover?: () => void;
  onUpdateCover?: (cover: File) => void;
  submitLabel: string;
};

export default function CreateTopicForm({
  conversationType = "topic",
  initialValues,
  onSubmit,
  isPending,
  error,
  coverUrl,
  onDeleteCover,
  onUpdateCover,
  submitLabel,
}: Props) {
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [form, setForm] = useState<{
    title?: string;
    description?: string;
    startsAtDate?: string;
    startsAtTime?: string;
    endsAtDate?: string;
    endsAtTime?: string;
    price?: string;
    venue?: string;
    url?: string;
    closedToContributionsAt?: Date | null;
  }>({
    title: initialValues?.title,
    description: initialValues?.description,
    startsAtDate:
      getDateTimeAsInputValue(initialValues?.startsAt).date || undefined,
    startsAtTime:
      getDateTimeAsInputValue(initialValues?.startsAt).time || undefined,
    endsAtDate:
      getDateTimeAsInputValue(initialValues?.endsAt).date || undefined,
    endsAtTime:
      getDateTimeAsInputValue(initialValues?.endsAt).time || undefined,
    price: initialValues?.price ?? undefined,
    venue: initialValues?.venue ?? undefined,
    url: initialValues?.url ?? undefined,
    closedToContributionsAt: initialValues?.closedToContributionsAt ?? null,
  });
  const [coverFile, setCoverFile] = useState<File | undefined>(undefined);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    url?: string;
    rules?: string;
  }>({});
  const [previewSrc, setPreviewSrc] = useState<string | undefined>(undefined);

  const conversationSpecifications =
    CONVERSATION_TYPE_SPECIFICATIONS[conversationType];

  return (
    <Form
      id="conversation-form"
      noValidate
      className="grid max-h-[80dvh] grid-cols-1 grid-rows-[1fr_auto] overflow-hidden"
      onChange={(e) => {
        if (!(e.target instanceof HTMLInputElement) || e.target.type !== "file")
          return;
        const file = e.target.files?.[0];
        if (!file || file.size === 0) return;
        setCoverFile(file);
        onUpdateCover?.(file);
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

        const rulesNotAccepted = !initialValues && !rulesAccepted;
        const parsed = ConversationFormSchema.safeParse({
          title: form.title ?? "",
          description: form.description ?? "",
          startsAt: form.startsAtDate
            ? getDateTime(
                form.startsAtDate,
                form.startsAtTime ?? ""
              ).toISOString()
            : undefined,
          endsAt: form.endsAtDate
            ? getDateTime(form.endsAtDate, form.endsAtTime ?? "").toISOString()
            : undefined,
          price: form.price,
          venue: form.venue || undefined,
          url: form.url || undefined,
          closedToContributionsAt: form.closedToContributionsAt?.toISOString(),
        });

        if (!parsed.success || rulesNotAccepted) {
          const fieldErrors = parsed.success
            ? {}
            : parsed.error.flatten().fieldErrors;
          return setErrors({
            title: fieldErrors.title?.[0],
            description: fieldErrors.description?.[0],
            url: fieldErrors.url?.[0],
            rules: rulesNotAccepted
              ? "Veuillez accepter les règles du forum"
              : undefined,
          });
        }

        onSubmit({
          title: parsed.data.title,
          description: parsed.data.description,
          startsAt: parsed.data.startsAt,
          endsAt: parsed.data.endsAt,
          price: parsed.data.price,
          venue: parsed.data.venue,
          url: parsed.data.url,
          cover: coverFile,
          closedToContributionsAt: parsed.data.closedToContributionsAt,
        });
      }}
    >
      <div className="overflow-y-scroll">
        <FormField>
          <Label htmlFor="title" aria-required>
            Titre{" "}
            <em className="font-light not-italic text-neutral-300">
              (100 caractères max.)
            </em>
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
            Description{" "}
            <em className="font-light not-italic text-neutral-300">
              (500 caractères max.)
            </em>
          </Label>
          <AugmentedTextarea
            id="description"
            name="description"
            className={inputClassName("min-h-20")}
            required
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <FieldError>{errors.description}</FieldError>
        </FormField>
        <div className="grid grid-cols-2">
          {conversationSpecifications.startsAt && (
            <FormField>
              <Label htmlFor="startsAtDate" aria-required>
                {conversationType === "EVENT"
                  ? "Date de début"
                  : "Date de sortie"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="startsAtDate"
                  type="date"
                  value={form.startsAtDate ?? ""}
                  required
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      startsAtDate: e.target.value,
                    }))
                  }
                />
                {conversationType === "EVENT" && (
                  <Input
                    id="startsAtTime"
                    type="time"
                    disabled={!form.startsAtDate}
                    value={form.startsAtTime ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        startsAtTime: e.target.value,
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
                  value={form.endsAtDate ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, endsAtDate: e.target.value }))
                  }
                />
                <Input
                  id="endsAtTime"
                  type="time"
                  disabled={!form.endsAtDate}
                  value={form.endsAtTime ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, endsAtTime: e.target.value }))
                  }
                />
              </div>
              <FieldError>{null}</FieldError>
            </FormField>
          )}
        </div>
        {conversationSpecifications.price && (
          <FormField>
            <Label htmlFor="price">Tarif(s)</Label>
            <Input
              id="price"
              name="price"
              type="text"
              value={form.price ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, price: e.target.value }))
              }
            />
            <FieldError>{null}</FieldError>
          </FormField>
        )}
        {conversationSpecifications.venue && (
          <FormField>
            <Label htmlFor="venue">Lieu</Label>
            <Input
              id="venue"
              name="venue"
              type="text"
              value={form.venue ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, venue: e.target.value }))
              }
            />
            <FieldError>{null}</FieldError>
          </FormField>
        )}
        {conversationSpecifications.url && (
          <FormField>
            <Label htmlFor="url">
              Lien{" "}
              <em className="font-light text-neutral-100">
                (billeterie, site internet...)
              </em>
            </Label>
            <Input
              id="url"
              name="url"
              type="url"
              value={form.url ?? ""}
              placeholder="https://"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, url: e.target.value }))
              }
            />
            <FieldError>{errors.url}</FieldError>
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
            <div className="flex flex-col gap-2">
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
                  className="h-auto max-h-64 w-full rounded-sm bg-neutral-900 object-contain"
                />
              )}
            </div>
            <FieldError>{null}</FieldError>
          </FormField>
        )}
        {!initialValues &&
          conversationSpecifications.closableToContributions && (
            <FormField>
              <div className="flex items-center gap-2">
                <input
                  id="closed-to-contributions"
                  type="checkbox"
                  className="accent-purple-300"
                  checked={
                    form.closedToContributionsAt !== null &&
                    form.closedToContributionsAt !== undefined
                  }
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      closedToContributionsAt: e.target.checked
                        ? prev.closedToContributionsAt || new Date()
                        : null,
                    }))
                  }
                />
                <Label htmlFor="closed-to-contributions">
                  Désactiver les contributions
                </Label>
              </div>
              <p className="text-muted-foreground text-sm">
                Vous seul pourrez poster des messages.
              </p>
            </FormField>
          )}
      </div>
      <div>
        {!initialValues && (
          <div className="flex items-center gap-2 py-2">
            <input
              id="rules-acceptance"
              type="checkbox"
              checked={rulesAccepted}
              className="accent-purple-300"
              onChange={(e) => setRulesAccepted(e.target.checked)}
            />
            <label
              htmlFor="rules-acceptance"
              className={cn("text-sm", errors.rules && "text-red-500")}
            >
              Je m&apos;engage à respecter les{" "}
              <Link
                href={`/forum/cgu`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 underline transition-colors hover:text-purple-400"
              >
                règles
              </Link>{" "}
              du forum
            </label>
          </div>
        )}
        <Button
          form="conversation-form"
          type="submit"
          disabled={isPending}
          className="w-full"
        >
          {submitLabel}
          {isPending && <Loader className="size-4 animate-spin" />}
        </Button>
        {error && (
          <FieldError className="mt-2 rounded-sm border border-red-500 bg-red-500/15 px-2 text-center">
            {error.message ??
              "Erreur inconnue, veuillez réessayer ou nous signaler un bug."}
          </FieldError>
        )}
      </div>
    </Form>
  );
}
