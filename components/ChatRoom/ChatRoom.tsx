"use client";

import { DialogTitle } from "@radix-ui/react-dialog";

import { useState } from "react";

import { ArrowLeft, ImageIcon, Loader, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import useMe from "@/lib/auth/useMe";
import useConversation from "@/lib/forum/useConversation";
import useDeleteConversation from "@/lib/forum/useDeleteConversation";
import useUpdateConversation from "@/lib/forum/useUpdateConversation";
import getImageResolution from "@/lib/getImageResolution";
import { Conversation } from "@/lib/types";

import Button from "../Button/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import MessagesList from "./MessagesList/MessagesList";
import SubmitMessageForm from "./SubmitMessageForm/SubmitMessageForm";

function UpdateConversationCover({
  conversation,
}: {
  conversation: Conversation;
}) {
  const { updateConversation, isPending } = useUpdateConversation();
  const [errors, setErrors] = useState<{ coverSize?: string }>({});
  return (
    <form
      onChange={async (e) => {
        e.preventDefault();
        if (isPending) return;

        const coverFile = new FormData(e.currentTarget).get("coverFile");
        if (coverFile instanceof File) {
          if (coverFile.size > 2 * 1024 * 1024) {
            return setErrors({
              coverSize: `La taille de l'image sélectionnée dépasse le maximum autorisé de 2Mo.`,
            });
          }
          const imageResolution = await getImageResolution(coverFile);
          const cover = {
            file: coverFile,
            width: imageResolution.width,
            height: imageResolution.height,
          };
          updateConversation({
            id: conversation.id,
            title: conversation.title,
            description: conversation.description ?? "",
            cover,
          });
        }
      }}
    >
      <label
        htmlFor="coverFile"
        className="inline-flex cursor-pointer items-center gap-2 rounded-sm p-2 hover:bg-gray-800 hover:text-gray-100"
      >
        <ImageIcon className="size-5" />
        <input
          id="coverFile"
          name="coverFile"
          type="file"
          hidden
          accept="image/*"
        />
      </label>
      {errors.coverSize && (
        <Dialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setErrors((prev) => {
                return { ...prev, coverSize: undefined };
              });
            }
          }}
        >
          <DialogContent className="grid max-h-[90dvh] w-full max-w-[90dvw] grid-cols-1 grid-rows-[min-content_1fr_min-content] gap-0 overflow-hidden rounded-sm border border-gray-500 bg-white p-0 text-black landscape:max-w-96">
            <DialogHeader className="bg-black p-4 text-white">
              <DialogTitle>Echec de chargement</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2 bg-white p-2">
              <p>{errors.coverSize}</p>
              <footer className="flex items-center justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setErrors((prev) => {
                      return { ...prev, coverSize: undefined };
                    });
                  }}
                >
                  Fermer
                </Button>
              </footer>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </form>
  );
}

function DeleteConversationButton({
  conversation,
}: {
  conversation: Conversation;
}) {
  const router = useRouter();
  const { deleteConversation, isPending } = useDeleteConversation({
    onSuccess: () => {
      router.push("/forum");
    },
  });
  return (
    <button
      className="inline-flex items-center gap-2 rounded-sm p-2 hover:bg-gray-800 hover:text-gray-100"
      disabled={isPending}
      onClick={() => {
        deleteConversation(conversation.id);
      }}
    >
      {isPending ? (
        <Loader className="size-5 animate-spin" />
      ) : (
        <Trash2 className="size-5" />
      )}
      <span className="sr-only">Supprimer</span>
    </button>
  );
}

function UpdateConversationButton({
  conversation,
}: {
  conversation: Conversation;
}) {
  const { updateConversation, isPending } = useUpdateConversation();
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center gap-2 rounded-sm p-2 hover:bg-gray-800 hover:text-gray-100">
        <>
          {isPending ? (
            <Loader className="size-5 animate-spin" />
          ) : (
            <Pencil className="size-5" />
          )}
          <span className="sr-only">Modifier</span>
        </>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la conversation</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErrors({});
            const parsedInputs = z
              .object({
                title: z.optional(
                  z
                    .string()
                    .min(3, { message: "titre trop court (3 char min)" })
                ),
                description: z.optional(
                  z
                    .string()
                    .min(3, { message: "titre trop court (3 char min)" })
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
            });
          }}
        >
          <div>
            <label htmlFor="title">Titre</label>
            <input
              id="title"
              name="title"
              defaultValue={conversation.title ?? ""}
              type="text"
            />
            <p className="text-sm text-red-500">
              {errors.title ?? <>&nbsp;</>}
            </p>
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              defaultValue={conversation.description ?? ""}
              type="text"
            />
            <p className="text-sm text-red-500">
              {errors.description ?? <>&nbsp;</>}
            </p>
          </div>
          <button type="submit">Modifier</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type Props = {
  conversationId: string;
};

export default function ChatRoom({ conversationId }: Props) {
  const { me } = useMe();
  const { conversation, isLoading, lastEmptyLiRef, scrollToBottom } =
    useConversation(conversationId);

  if (isLoading)
    return (
      <div className="fixed left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2">
        <Loader className="animate-spin" />
      </div>
    );

  if (!conversation || !me)
    return (
      <p className="self-center text-center font-light">
        Conversation introuvable...
      </p>
    );

  return (
    <div className="grid grid-cols-1 grid-rows-[min-content_1fr_min-content]">
      <header className="flex flex-col">
        <div className="flex items-center gap-4 bg-black pb-2">
          <nav>
            <Link href={`/forum`}>
              <ArrowLeft />
            </Link>
          </nav>
          <div className="mr-auto">
            <h1 className="font-semibold uppercase leading-[1]">
              {conversation.title}
            </h1>
            <p className="pl-2 text-sm font-light">
              {conversation.description}
            </p>
          </div>
          {conversation.createdBy.id === me.id && (
            <div className="flex items-center gap-1">
              <UpdateConversationButton conversation={conversation} />
              <UpdateConversationCover conversation={conversation} />
              <DeleteConversationButton conversation={conversation} />
            </div>
          )}
        </div>
      </header>

      <section
        aria-labelledby="messages-section"
        className="no-scrollbar overflow-y-scroll bg-black px-1 sm:max-w-2xl landscape:px-0"
      >
        <h2 className="sr-only" id="messages-section">
          Messages
        </h2>
        <MessagesList
          conversation={conversation}
          lastEmptyLiRef={lastEmptyLiRef}
          scrollToBottom={scrollToBottom}
        />
      </section>
      <div className="px-1 landscape:px-0">
        <SubmitMessageForm
          conversationId={conversation.id}
          onSuccess={(e) => {
            scrollToBottom();
            (e.target as HTMLFormElement).reset();
          }}
        />
      </div>

      {isLoading && (
        <div className="fixed left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2">
          <Loader className="animate-spin" />
        </div>
      )}
    </div>
  );
}
