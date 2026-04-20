"use client";

import MessageItem from "@/components/ChatRoom/MessagesList/MessageItem/MessageItem";
import ConversationItem from "@/components/ConversationItem/ConversationItem";
import useMe from "@/lib/auth/useMe";
import useBannedUsers from "@/lib/forum/useBannedUsers";
import useConversations from "@/lib/forum/useConversations";
import useReportedMessages from "@/lib/forum/useReportedMessages";

export default function AdminPage() {
  const { me } = useMe();
  const { reportedMessages } = useReportedMessages();
  const { conversations } = useConversations();
  const reportedConversations = conversations.filter((c) => c.reportedAt);
  const { bannedUsers } = useBannedUsers();

  if (me?.role !== "admin") return null;

  return (
    <div className="no-scrollbar flex flex-col overflow-y-scroll bg-black px-2 sm:max-w-2xl">
      <h2 className="text-center text-xl leading-12 font-thin uppercase">
        Administration du forum
      </h2>
      {reportedMessages.length > 0 && (
        <section className="flex flex-col gap-2 pb-8">
          <h3 className="bg-foreground text-background rounded-sm px-2 font-semibold">
            Messages signalés
          </h3>
          <ul className="flex flex-col gap-6">
            {reportedMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                conversation={undefined}
                threadedMessages={[]}
                hasMention={false}
                variant="admin"
              />
            ))}
          </ul>
        </section>
      )}
      {reportedConversations.length > 0 && (
        <section className="flex flex-col gap-2 pb-8">
          <h3 className="bg-foreground text-background rounded-sm px-2 font-semibold">
            Conversations signalées
          </h3>
          <ul className="flex flex-col">
            {reportedConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                variant="admin"
                me={me}
              />
            ))}
          </ul>
        </section>
      )}
      {bannedUsers.length > 0 && (
        <section className="flex flex-col gap-2 pb-8">
          <h3 className="bg-foreground text-background rounded-sm px-2 font-semibold">
            Utilisateurs bannis
          </h3>
          <ul className="flex flex-col">
            {bannedUsers.map((user) => (
              <li
                key={user.id}
                className="flex flex-col border-b border-white px-4 py-2 first:border-t"
              >
                <span className="font-semibold text-neutral-400 line-through">
                  {user.pseudo}
                </span>
                <span className="text-xs text-neutral-400">
                  banni le{" "}
                  {new Date(user.bannedAt!).toLocaleDateString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
