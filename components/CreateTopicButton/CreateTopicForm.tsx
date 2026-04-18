import { useState } from "react";

import { Loader } from "lucide-react";
import Image from "next/image";

import usePostConversation from "@/lib/forum/usePostConversation";

import Button, { buttonClassName } from "../Button/Button";
import Form, { FieldError, FormField, Input, Label } from "../Form/Form";

const CONVERSATION_TYPE_SPECIFICATIONS = {
  TOPIC: {
    cover: false,
  },
  EVENT: {
    cover: true,
  },
  RELEASE: {
    cover: true,
  },
};

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
  }>({});
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});
  const [previewSrc, setPreviewSrc] = useState<string | undefined>(undefined);

  const { postConversation, isPending, error } = usePostConversation();

  return (
    <Form
      id="post-conversation"
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
            cover: file instanceof File ? file : undefined,
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
              return {
                ...prev,
                title: e.target.value,
              };
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
      {CONVERSATION_TYPE_SPECIFICATIONS[conversationType].cover && (
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
