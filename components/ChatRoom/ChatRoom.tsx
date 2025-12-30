"use client";

import { Suspense } from "react";

import { ArrowLeft, Loader } from "lucide-react";
import Link from "next/link";

import useMe from "@/lib/auth/useMe";
import useConversation from "@/lib/forum/useConversation";

import DeleteConversationButton from "./DeleteConversationButton/DeleteConversationButton";
import MessagesList from "./MessagesList/MessagesList";
import SubmitMessageForm from "./SubmitMessageForm/SubmitMessageForm";
import UpdateConversationButton from "./UpdateConversationButton/UpdateConversationButton";

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
        <Suspense>
          <MessagesList
            conversation={conversation}
            lastEmptyLiRef={lastEmptyLiRef}
            scrollToBottom={scrollToBottom}
          />
        </Suspense>
      </section>
      <div className="px-1 landscape:px-0">
        <SubmitMessageForm
          conversationId={conversation.id}
          onSuccess={() => {
            scrollToBottom();
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
