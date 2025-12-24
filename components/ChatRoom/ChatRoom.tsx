"use client";

import { DialogTitle } from "@radix-ui/react-dialog";

import { useState } from "react";

import { ArrowLeft, Loader, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import useMe from "@/lib/auth/useMe";
import useConversation from "@/lib/forum/useConversation";
import useDeleteConversation from "@/lib/forum/useDeleteConversation";
import useUpdateConversation from "@/lib/forum/useUpdateConversation";
import { Conversation } from "@/lib/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import MessagesList from "./MessagesList/MessagesList";
import SubmitMessageForm from "./SubmitMessageForm/SubmitMessageForm";

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
      <DialogTrigger>
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
            <>
              <UpdateConversationButton conversation={conversation} />
              <DeleteConversationButton conversation={conversation} />
            </>
          )}
        </div>
        {conversation.coverUrl &&
          conversation.coverWidth &&
          conversation.coverHeight && (
            <Image
              src={conversation.coverUrl}
              width={conversation.coverWidth}
              height={conversation.coverHeight}
              alt=""
              aria-hidden
              className=""
            />
          )}
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
