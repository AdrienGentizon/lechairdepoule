"use client";

import useConversation from "@/lib/hooks/useConversation";
import useMe from "@/lib/hooks/useMe";
import { ArrowLeft, Loader, Trash2 } from "lucide-react";
import Link from "next/link";
import SubmitMessageForm from "./SubmitMessageForm/SubmitMessageForm";
import MessagesList from "./MessagesList/MessagesList";
import { Conversation } from "@/lib/types";
import useDeleteConversation from "@/lib/hooks/useDeleteConversation";
import { useRouter } from "next/navigation";

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

type Props = {
  conversationId: string;
};

export default function ChatRoom({ conversationId }: Props) {
  const { me } = useMe();
  const { conversation, isLoading, lastEmptyLiRef, scrollToBottom } =
    useConversation(conversationId);

  if (!conversation || !me)
    return (
      <main className="row-span-2 grid grid-cols-1 grid-rows-1 items-center justify-center">
        <p className="self-center text-center font-light">
          Conversation introuvable...
        </p>
      </main>
    );

  return (
    <>
      <header className="flex items-center gap-4 bg-black pb-2">
        <nav>
          <Link href={`/forum`}>
            <ArrowLeft />
          </Link>
        </nav>
        <div className="mr-auto">
          <h1 className="font-semibold uppercase leading-[1]">
            {conversation.title}
          </h1>
          <p className="pl-2 text-sm font-light">{conversation.description}</p>
        </div>
        {conversation.createdBy.id === me.id && (
          <DeleteConversationButton conversation={conversation} />
        )}
      </header>

      <main className="no-scrollbar overflow-y-scroll bg-black px-1 sm:max-w-2xl landscape:px-0">
        <MessagesList
          me={me}
          conversation={conversation}
          lastEmptyLiRef={lastEmptyLiRef}
          scrollToBottom={scrollToBottom}
        />
      </main>
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
    </>
  );
}
