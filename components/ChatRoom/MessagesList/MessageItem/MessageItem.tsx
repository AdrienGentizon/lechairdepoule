import { useId, useState } from "react";

import { z } from "zod";

import Button from "@/components/Button/Button";
import { FormField, Label } from "@/components/Form/Form";
import useMe from "@/lib/auth/useMe";
import usePostConversationMessage from "@/lib/forum/usePostConversationMessage";
import { Message, isMessageWithConversationId } from "@/lib/types";
import { cn } from "@/lib/utils";

import BanUserButton from "./BanUserButton/BanUserButton";
import CreateThreadButton from "./CreateThreadButton/CreateThreadButton";
import ReportMessageButton from "./ReportMessageButton/ReportMessageButton";

export default function MessageItem({
  message,
  threadedMessages,
}: {
  message: Message;
  threadedMessages: Message[];
}) {
  const { me } = useMe();
  const { postConversationMessage, isPending } = usePostConversationMessage(
    message.conversationId ?? "-1"
  );

  const formId = useId();
  const texareaId = useId();

  const [showThread, setShowThread] = useState(false);

  const canReportMessage = (message: Message) => {
    if (message.user.id === me?.id) return false;
    return true;
  };

  const canBanMessageUser = (message: Message) => {
    if (me?.role !== "admin") return false;
    if (message.user.id === me?.id) return false;
    return true;
  };

  const canShowThread = () => {
    if (!showThread) return false;
    if (message.parentMessageId !== null) return false;
    return true;
  };

  return (
    <>
      <li className="group relative">
        <div className="flex items-center gap-2">
          <div className="flex w-full text-xs font-medium">
            <div className="flex items-center gap-2 rounded-t-sm bg-white px-2 text-black">
              <h3
                className={cn(
                  "text-sm",
                  message.user.bannedAt && "line-through"
                )}
              >
                {message.user.pseudo}
              </h3>
            </div>
            <div className="ml-auto flex items-center gap-1 group-hover:flex landscape:hidden">
              {canReportMessage(message) && (
                <ReportMessageButton message={message} />
              )}
              {canBanMessageUser(message) && (
                <BanUserButton message={message} />
              )}
            </div>
          </div>
        </div>
        <div className="rounded-b-sm border border-white">
          <p
            className={cn(
              "px-4 py-2 font-courier",
              (message.reportedAt !== null || message.user.bannedAt !== null) &&
                "text-neutral-400 line-through"
            )}
          >
            {message.body}
          </p>
          <footer className="flex items-center justify-end gap-2 px-2 pb-2 font-mono text-[0.6rem] font-light">
            {threadedMessages.length > 0 && (
              <p className="cursor-pointer underline">
                <button
                  onClick={() => {
                    setShowThread(true);
                  }}
                >
                  {showThread ? "cacher" : "voir"} {threadedMessages.length}{" "}
                  réponse(s)
                </button>
              </p>
            )}
            <time dateTime={new Date(message.createdAt).toLocaleString()}>
              {new Date(message.createdAt).toLocaleDateString()}{" "}
              {new Date(message.createdAt).toLocaleTimeString()}
            </time>
          </footer>
        </div>
        {!showThread &&
          isMessageWithConversationId(message) &&
          message.parentMessageId === null && (
            <CreateThreadButton
              onClick={() => {
                setShowThread(true);
              }}
            />
          )}
      </li>
      {showThread && (
        <li className="ml-auto w-full max-w-[calc(100%-4rem)] pb-4">
          <ul className="flex flex-col gap-2 rounded-sm border border-white p-2">
            {threadedMessages.map((threadedMessage) => {
              return (
                <MessageItem
                  key={`message-${message.id}-thread-${threadedMessage.id}`}
                  message={threadedMessage}
                  threadedMessages={[]}
                />
              );
            })}
            <li>
              <form
                id={formId}
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!e.currentTarget.checkValidity()) return;
                  const parsedInputs = z
                    .object({ body: z.string() })
                    .safeParse(
                      Object.fromEntries(
                        new FormData(e.currentTarget).entries()
                      )
                    );

                  if (!parsedInputs.success) {
                    return console.error(parsedInputs.error.message);
                  }

                  postConversationMessage(
                    {
                      body: parsedInputs.data.body,
                      parentMessageId: message.id,
                    },
                    {
                      onSuccess: () => {
                        e.currentTarget.reset();
                      },
                    }
                  );
                }}
              >
                <FormField>
                  <Label htmlFor={texareaId}>Message</Label>
                  <textarea
                    id={texareaId}
                    name="body"
                    className="min-h-20 rounded-sm px-4 py-2 font-courier text-black"
                  />
                </FormField>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowThread(false);
                    }}
                  >
                    Fermer
                  </Button>

                  <Button
                    variant="secondary"
                    type="submit"
                    form={formId}
                    disabled={isPending}
                  >
                    Envoyer
                  </Button>
                </div>
              </form>
            </li>
          </ul>
        </li>
      )}
    </>
  );
}
