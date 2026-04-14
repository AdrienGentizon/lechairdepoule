import { useState } from "react";

import { Loader, Plus } from "lucide-react";

import usePostConversation from "@/lib/forum/usePostConversation";

import Button, { buttonClassName } from "../Button/Button";
import Form, { FieldError, FormField, Input, Label } from "../Form/Form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export default function CreateTopicButton() {
  const [newConversation, setNewConversation] = useState<{
    title?: string;
    description?: string;
  }>({});
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});
  const [previewSrc, setPreviewSrc] = useState<string | undefined>(undefined);
  const [openCreateConversation, setOpenCreateConversation] = useState(false);

  const { postConversation, isPending } = usePostConversation();

  return (
    <Dialog
      open={openCreateConversation}
      onOpenChange={setOpenCreateConversation}
    >
      <DialogTrigger className="flex w-full items-center justify-center gap-2 px-4 py-6 font-light uppercase">
        <Plus className="stroke-1" />
        Créer un Topic
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau Topic</DialogTitle>
        </DialogHeader>
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
                description: titleEmpty ? `Description obligatoire` : undefined,
              });

            postConversation({
              title: newConversation.title,
              description: newConversation.description,
              cover: file instanceof File ? file : undefined,
            });
            setNewConversation({});
            setTimeout(() => {
              setOpenCreateConversation(false);
            }, 750);
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
          </FormField>
          <FormField>
            <Label htmlFor="file">Photo de couverture</Label>
            <label htmlFor="file" className={buttonClassName("w-full")}>
              Sélectionner un fichier...
            </label>
            <Input id="file" name="file" type="file" accept="image/*" hidden />
            {previewSrc && (
              <img src={previewSrc} className="max-h-96 object-contain py-2" />
            )}
            <FieldError>{null}</FieldError>
          </FormField>
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
            <span className="relative">
              Créer un Topic
              {isPending && <Loader />}
            </span>
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
