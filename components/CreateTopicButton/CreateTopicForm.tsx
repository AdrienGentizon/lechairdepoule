import { useState } from "react";

import { Loader } from "lucide-react";
import Image from "next/image";

import usePostConversation from "@/lib/forum/usePostConversation";

import Button, { buttonClassName } from "../Button/Button";
import Form, { FieldError, FormField, Input, Label } from "../Form/Form";

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

type Props = {
  conversationType: "TOPIC" | "EVENT" | "RELEASE";
  onSuccess: (conversationId: string) => void;
};

export default function CreateTopicForm({
  conversationType = "TOPIC",
  onSuccess,
}: Props) {
  const [newConversation, setNewConversation] = useState<{
    title?: string;
    description?: string;
    startsAt?: Date;
    endsAt?: Date;
  }>({});
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});
  const [previewSrc, setPreviewSrc] = useState<string | undefined>(undefined);

  const { postConversation, isPending, error } = usePostConversation();
  const conversationSpecifications =
    CONVERSATION_TYPE_SPECIFICATIONS[conversationType];

  return (
    <Form
      id="post-conversation"
      className="overflow-y-scroll"
      onChange={(e) => {
        const file = new FormData(e.currentTarget).get("file");
        if (!(file instanceof File)) return;
        if (file.size === 0) return;

        const reader = new FileReader();
        reader.onload = function (e) {
          if (typeof e.target?.result === "string")
            setPreviewSrc(e.target.result);
        };
        reader.readAsDataURL(file);
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        setErrors({});

        const file = new FormData(e.currentTarget).get("file");

        const titleEmpty = (newConversation.title?.length ?? 0) <= 0;
        const descriptionEmpty =
          (newConversation.description?.length ?? 0) <= 0;

        if (
          !newConversation.title ||
          !newConversation.description ||
          titleEmpty ||
          descriptionEmpty
        )
          return setErrors({
            title: titleEmpty ? `Titre obligatoire` : undefined,
            description: descriptionEmpty
              ? `Description obligatoire`
              : undefined,
          });

        postConversation(
          {
            title: newConversation.title,
            description: newConversation.description,
            type: conversationType,
            cover: file instanceof File ? file : undefined,
            startsAt: newConversation.startsAt?.toISOString(),
            endsAt: newConversation.endsAt?.toISOString(),
          },
          {
            onSuccess: (data) => {
              onSuccess(data.id);
              setNewConversation({});
            },
          }
        );
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
          value={newConversation?.title ?? ""}
          onChange={(e) => {
            setNewConversation((prev) => {
              return { ...prev, title: e.target.value };
            });
          }}
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
          value={newConversation?.description ?? ""}
          onChange={(e) => {
            setNewConversation((prev) => {
              return {
                ...prev,
                description: e.target.value,
              };
            });
          }}
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
              value={getDateTimeAsInputValue(newConversation.startsAt).date}
              onChange={(e) =>
                setNewConversation((prev) => ({
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
                disabled={!newConversation.startsAt}
                value={getDateTimeAsInputValue(newConversation.startsAt).time}
                onChange={(e) =>
                  setNewConversation((prev) => ({
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
              value={getDateTimeAsInputValue(newConversation.endsAt).date}
              onChange={(e) =>
                setNewConversation((prev) => ({
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
              disabled={!newConversation.endsAt}
              value={getDateTimeAsInputValue(newConversation.endsAt).time}
              onChange={(e) =>
                setNewConversation((prev) => ({
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
      <Button
        form="post-conversation"
        type="submit"
        className="mt-9 w-full"
        disabled={
          isPending ||
          (newConversation.title?.length ?? 0) <= 0 ||
          (newConversation.description?.length ?? 0) <= 0
        }
      >
        Créer un Topic
        {isPending && <Loader className="size-4 animate-spin" />}
      </Button>
      {error && (
        <FieldError className="mt-2 rounded-sm border border-red-500 bg-red-500/15 px-2 text-center">
          {(error as Error)?.message ??
            "Erreur inconnue, veuillez réessayer ou nous signaler un bug."}
        </FieldError>
      )}
    </Form>
  );
}
