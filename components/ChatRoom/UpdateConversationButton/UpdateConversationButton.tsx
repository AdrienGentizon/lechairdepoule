import { useState } from "react";

import { Loader, Pencil } from "lucide-react";
import { z } from "zod";

import Button, { buttonClassName } from "@/components/Button/Button";
import Form, {
  FieldError,
  FormField,
  Input,
  Label,
} from "@/components/Form/Form";
import { DialogHeader } from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useUpdateConversation from "@/lib/forum/useUpdateConversation";
import { Conversation } from "@/lib/types";

export default function UpdateConversationButton({
  conversation,
}: {
  conversation: Conversation;
}) {
  const [previewSrc, setPreviewSrc] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const { updateConversation, isPending } = useUpdateConversation({
    onSuccess: () => {
      setOpen(false);
    },
  });
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 rounded-sm p-2 hover:bg-neutral-800 hover:text-neutral-100">
        <Pencil className="size-5" />
        <span className="sr-only">Modifier</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la conversation</DialogTitle>
        </DialogHeader>
        <Form
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
          onSubmit={(e) => {
            e.preventDefault();
            setErrors({});
            const file = new FormData(e.currentTarget).get("file");

            const parsedInputs = z
              .object({
                title: z.optional(
                  z
                    .string()
                    .min(3, { message: "Titre trop court (3 char min)" })
                ),
                description: z.optional(
                  z.string().min(3, {
                    message: "Description trop courte (3 char min)",
                  })
                ),
              })
              .safeParse(
                Object.fromEntries(new FormData(e.currentTarget).entries())
              );

            if (!parsedInputs.success) {
              return setErrors({
                title:
                  parsedInputs.error.formErrors.fieldErrors.title?.toString(),
                description:
                  parsedInputs.error.formErrors.fieldErrors.description?.toString(),
              });
            }

            updateConversation({
              id: conversation.id,
              title: parsedInputs.data.title ?? conversation.title,
              description:
                parsedInputs.data.description ?? conversation.description ?? "",
              cover: file instanceof File ? file : undefined,
            });
          }}
        >
          <FormField>
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              name="title"
              defaultValue={conversation.title ?? ""}
              type="text"
            />
            <FieldError className="text-sm text-red-500">
              {errors.title ?? <>&nbsp;</>}
            </FieldError>
          </FormField>
          <FormField>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              defaultValue={conversation.description ?? ""}
              type="text"
            />
            <FieldError className="text-sm text-red-500">
              {errors.description ?? <>&nbsp;</>}
            </FieldError>
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
          <Button className="ml-auto" type="submit" disabled={isPending}>
            Modifier
          </Button>
        </Form>
        {isPending && (
          <Loader className="absolute inset-0 left-1/2 top-1/2 z-50 -ml-3 animate-spin stroke-2" />
        )}
      </DialogContent>
    </Dialog>
  );
}
