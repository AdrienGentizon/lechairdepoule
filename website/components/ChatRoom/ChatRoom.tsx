"use client";

import { Suspense } from "react";

import useMe from "@/lib/auth/useMe";
import useConversation from "@/lib/forum/useConversation";

import Loader from "../Loader/Loader";
import { ChatRoomProvider } from "./ChatRoomContext";
import ChatRoomHeader from "./ConversationHeader/ChatRoomHeader";
import MessagesList from "./MessagesList/MessagesList";
import SubmitMessageForm from "./SubmitMessageForm/SubmitMessageForm";

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
      <ChatRoomHeader me={me} conversation={conversation} />
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
