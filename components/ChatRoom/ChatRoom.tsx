"use client";

import { Suspense } from "react";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import useMe from "@/lib/auth/useMe";
import useConversation from "@/lib/forum/useConversation";
import { getConversationMetadataAsString } from "@/lib/forum/utils";
import { cn } from "@/lib/utils";

import ConversationUrl from "../ConversationsList/ConversationUrl";
import Loader from "../Loader/Loader";
import TextParser from "../TextParser";
import { ChatRoomProvider } from "./ChatRoomContext";
import DeleteConversationButton from "./DeleteConversationButton/DeleteConversationButton";
import MessagesList from "./MessagesList/MessagesList";
import ReportConversationButton from "./ReportConversationButton/ReportConversationButton";
import SubmitMessageForm from "./SubmitMessageForm/SubmitMessageForm";
import UpdateConversationButton from "./UpdateConversationButton/UpdateConversationButton";

type Props = {
  conversationId: string;
  messageIdFromSearchParams: string | undefined;
};

function ChatRoom({ conversationId, messageIdFromSearchParams }: Props) {
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
    <div className="grid grid-cols-1 grid-rows-[auto_1fr_auto] px-1">
      <header className="bg-background text-foreground flex flex-col gap-2 py-2">
        <div className="flex items-center gap-4">
          <nav className="self-start">
            <Link href={`/forum`}>
              <ArrowLeft />
            </Link>
          </nav>
          <div className="flex flex-col gap-2">
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
                "text-sm font-light whitespace-pre-wrap",
                conversation.reportedAt && "text-neutral-400 line-through"
              )}
            >
              <TextParser text={conversation.description ?? ""} />
            </p>
            <ConversationUrl
              className="mt-2"
              conversation={conversation}
              hideIfInDescription
            />
          </div>
          <div className="ml-auto flex items-center gap-2 self-start pr-2">
            <UpdateConversationButton me={me} conversation={conversation} />
            <DeleteConversationButton me={me} conversation={conversation} />
            <ReportConversationButton me={me} conversation={conversation} />
          </div>
        </div>
        <div className="flex">
          <h3 className="ml-auto pr-2 text-xs">
            {getConversationMetadataAsString(conversation)}
          </h3>
        </div>
      </header>

      <Suspense>
        <MessagesList
          conversation={conversation}
          lastEmptyLiRef={lastEmptyLiRef}
          scrollToBottom={scrollToBottom}
          messageIdFromSearchParams={messageIdFromSearchParams}
        />
      </Suspense>

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

      {isLoading && <Loader />}
    </div>
  );
}

export default function Wrapper({
  conversationId,
  messageIdFromSearchParams,
}: Props) {
  return (
    <ChatRoomProvider>
      <ChatRoom
        conversationId={conversationId}
        messageIdFromSearchParams={messageIdFromSearchParams}
      />
    </ChatRoomProvider>
  );
}
