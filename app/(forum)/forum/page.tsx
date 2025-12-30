"use client";

import { useState } from "react";

import { ArrowRight, Loader, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Button, { buttonClassName } from "@/components/Button/Button";
import Form, {
  FieldError,
  FormField,
  Input,
  Label,
} from "@/components/Form/Form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useConversations from "@/lib/forum/useConversations";
import usePostConversation from "@/lib/forum/usePostConversation";

export default function ForumPage() {
  const router = useRouter();
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

  const { conversations, isLoading } = useConversations();
  const { postConversation, isPending } = usePostConversation();

  return (
    <>
      <ul className="grid auto-rows-min grid-cols-1 overflow-y-scroll">
        {conversations.map((conversation) => {
          return (
            <li
              key={`forum-${conversation.id}`}
              className="group relative flex h-min flex-col border-b border-white p-4 first:border-t"
              onClick={() => {
                router.push(`/forum/${conversation.id}`);
              }}
              role="link"
              aria-labelledby={`forum-${conversation.id}`}
            >
              <Link href={`/forum/${conversation.id}`}>
                <h2
                  id={`forum-${conversation.id}`}
                  className="font-semibold uppercase"
                >
                  {conversation.title}
                </h2>
                <p className="pl-2 text-sm font-light">
                  {conversation.description}
                </p>
                <button className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center font-thin uppercase group-hover:flex">
                  Rejoindre <ArrowRight />
                </button>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col border-b border-t border-white">
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
                    description: titleEmpty
                      ? `Description obligatoire`
                      : undefined,
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
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept="image/*"
                  hidden
                />
                {previewSrc && (
                  <img
                    src={previewSrc}
                    className="max-h-96 object-contain py-2"
                  />
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
                  {isPending && (
                    <Loader className="absolute left-0 top-1/2 -ml-5 -mt-2 size-4 animate-spin" />
                  )}
                </span>
              </Button>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading && (
        <div className="fixed left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2">
          <Loader className="animate-spin" />
        </div>
      )}
    </>
  );
}
