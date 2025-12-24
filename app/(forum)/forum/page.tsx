"use client";

import { useState } from "react";

import { ArrowRight, Loader, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Button, { buttonVariants } from "@/components/Button/Button";
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
import getImageResolution from "@/lib/getImageResolution";

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
      <div className="group relative flex flex-col border-b border-t border-white">
        <Dialog
          open={openCreateConversation}
          onOpenChange={setOpenCreateConversation}
        >
          <DialogTrigger className="flex w-full items-center justify-center gap-2 px-4 py-6 font-light uppercase">
            <Plus className="stroke-1" />
            Créer un Topic
          </DialogTrigger>
          <DialogContent className="grid max-h-[90dvh] w-full max-w-[90dvw] grid-cols-1 grid-rows-[min-content_1fr_min-content] gap-0 overflow-hidden rounded-sm border border-gray-500 bg-white p-0 text-black landscape:max-w-96">
            <DialogHeader className="bg-black p-4 text-white">
              <DialogTitle>Créer un Topic</DialogTitle>
            </DialogHeader>
            <Form
              id="post-conversation"
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

                let cover:
                  | { file: File; width: number; height: number }
                  | undefined = undefined;
                if (file instanceof File) {
                  try {
                    const imageResolution = await getImageResolution(file);
                    cover = {
                      file,
                      width: imageResolution.width,
                      height: imageResolution.height,
                    };
                  } catch (error) {
                    console.error(error);
                  }
                }

                postConversation({
                  title: newConversation.title,
                  description: newConversation.description,
                  cover,
                });
                setNewConversation({});
                setTimeout(() => {
                  setOpenCreateConversation(false);
                }, 750);
              }}
              className="bg-white p-2"
            >
              <FormField className="flex flex-col">
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
                  className="rounded-sm border border-black px-2 py-0.5 text-sm font-light"
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
                <label
                  htmlFor="file"
                  className={buttonVariants({
                    variant: "secondary",
                    className: "py-1 text-sm font-[375]",
                  })}
                >
                  Sélectionner un fichier...
                </label>
                <Input id="file" name="file" type="file" hidden />
                <FieldError>{null}</FieldError>
              </FormField>
            </Form>
            <footer className="flex flex-col gap-1 p-2">
              <Button
                form="post-conversation"
                variant="secondary"
                type="submit"
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

              <Button
                onClick={() => {
                  setOpenCreateConversation(false);
                }}
              >
                Fermer
              </Button>
            </footer>
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
