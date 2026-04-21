"use client";

import { Suspense } from "react";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import useMe from "@/lib/auth/useMe";
import useConversation from "@/lib/forum/useConversation";
import { getConversationMetadataAsString } from "@/lib/forum/utils";
import { cn } from "@/lib/utils";

import Loader from "../Loader/Loader";
import { ChatRoomProvider } from "./ChatRoomContext";
import DeleteConversationButton from "./DeleteConversationButton/DeleteConversationButton";
import MessagesList from "./MessagesList/MessagesList";
import ReportConversationButton from "./ReportConversationButton/ReportConversationButton";
import SubmitMessageForm from "./SubmitMessageForm/SubmitMessageForm";
import UpdateConversationButton from "./UpdateConversationButton/UpdateConversationButton";

type Props = {
  conversationId: string;
};

function ChatRoom({ conversationId }: Props) {
  const { me } = useMe();
  const { conversation, isLoading, lastEmptyLiRef, scrollToBottom } =
    useConversation(conversationId);

  if (isLoading) return <Loader />;

  if (!conversation || !me)
    return (
      <p className="self-center text-center font-light">
        Conversation introuvable...
      </p>
    );

  return (
    <div className="grid grid-cols-1 grid-rows-[min-content_1fr_min-content]">
      <header className="flex flex-col gap-2 py-2">
        <div className="flex items-center gap-4 bg-black">
          <nav>
            <Link href={`/forum`}>
              <ArrowLeft />
            </Link>
          </nav>
          <div className="mr-auto">
            <h1
              className={cn(
                "leading-none font-semibold uppercase",
                conversation.reportedAt && "text-neutral-400 line-through"
              )}
            >
              {conversation.title}
            </h1>
            <p
              className={cn(
                "text-sm font-light",
                conversation.reportedAt && "text-neutral-400 line-through"
              )}
            >
              {conversation.description}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <UpdateConversationButton me={me} conversation={conversation} />
            <DeleteConversationButton me={me} conversation={conversation} />
            <ReportConversationButton me={me} conversation={conversation} />
          </div>
        </div>
        <div className="flex">
          <h3 className="ml-auto text-xs">
            {getConversationMetadataAsString(conversation)}
          </h3>
        </div>
      </header>

      <section
        aria-labelledby="messages-section"
        className="no-scrollbar overflow-y-scroll bg-black px-1 py-2 sm:max-w-2xl"
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
      <div className="relative px-1">
        <div className="to-background pointer-events-none absolute inset-x-0 h-8 -translate-y-full bg-linear-to-b from-transparent" />
        <SubmitMessageForm
          me={me}
          conversation={conversation}
          formId="main"
          buttonLabel={`Envoyer`}
          placeholder={`Participer à la conversation...`}
          withCloseButton
          onSuccess={() => {
            scrollToBottom();
          }}
        />
      </div>

      {isLoading && <Loader />}
    </div>
  );
}

export default function Wrapper({ conversationId }: Props) {
  return (
    <ChatRoomProvider>
      <ChatRoom conversationId={conversationId} />
    </ChatRoomProvider>
  );
}
