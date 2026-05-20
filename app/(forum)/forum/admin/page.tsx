"use client";

import { Skull } from "lucide-react";

import BanUserTrigger from "@/components/BanUserTrigger/BanUserTrigger";
import MessageItem from "@/components/ChatRoom/MessagesList/MessageItem/MessageItem";
import ConversationItem from "@/components/ConversationsList/ConversationItem";
import useMe from "@/lib/auth/useMe";
import useBannedUsers from "@/lib/forum/useBannedUsers";
import useConversations from "@/lib/forum/useConversations";
import useReportedMessages from "@/lib/forum/useReportedMessages";
import { Conversation, Message, User } from "@/lib/types";

type ReportedUserEntry = {
  user: { id: string; pseudo: string; bannedAt: string | null };
  reportedMessageIds: string[];
  reportedConversationIds: string[];
};

function getReportedUsers(
  reportedMessages: Message[],
  reportedConversations: Omit<Conversation, "messages">[],
  bannedUsers: User[]
): ReportedUserEntry[] {
  const entries: ReportedUserEntry[] = [];
  for (const message of reportedMessages) {
    const entry = entries.find((e) => e.user.id === message.user.id);
    if (entry) entry.reportedMessageIds.push(message.id);
    else
      entries.push({
        user: message.user,
        reportedMessageIds: [message.id],
        reportedConversationIds: [],
      });
  }
  for (const conversation of reportedConversations) {
    const entry = entries.find((e) => e.user.id === conversation.createdBy.id);
    if (entry) entry.reportedConversationIds.push(conversation.id);
    else
      entries.push({
        user: conversation.createdBy,
        reportedMessageIds: [],
        reportedConversationIds: [conversation.id],
      });
  }
  const bannedUserIds = new Set(bannedUsers.map((u) => u.id));
  return entries
    .filter((e) => !bannedUserIds.has(e.user.id))
    .toSorted(
      (a, b) =>
        b.reportedMessageIds.length +
        b.reportedConversationIds.length -
        (a.reportedMessageIds.length + a.reportedConversationIds.length)
    );
}

export default function AdminPage() {
  const { me } = useMe();
  const { reportedMessages } = useReportedMessages();
  const { conversations } = useConversations();
  const reportedConversations = conversations.filter((c) => c.reportedAt);
  const { bannedUsers } = useBannedUsers();

  const reportedUsers = getReportedUsers(
    reportedMessages,
    reportedConversations,
    bannedUsers
  );

  if (me?.role !== "admin") return null;

  return (
    <div className="no-scrollbar flex flex-col overflow-y-scroll bg-black px-2 sm:max-w-2xl">
      <h1 className="bg-foreground text-background rounded-sm px-2 font-semibold">
        Administration du forum
      </h1>
      {reportedMessages.length +
        reportedConversations.length +
        reportedUsers.length +
        bannedUsers.length ===
        0 && (
        <p className="font-courier pt-3 pb-8 font-light">
          Aucun signalement en cours.
        </p>
      )}
      {reportedMessages.length > 0 && (
        <section className="flex flex-col gap-2 pb-8">
          <h2 className="bg-foreground text-background rounded-sm px-2 font-semibold">
            Messages signalés
          </h2>
          <ul className="flex flex-col gap-6">
            {reportedMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                conversation={undefined}
                threadedMessages={[]}
                variant="admin"
              />
            ))}
          </ul>
        </section>
      )}
      {reportedConversations.length > 0 && (
        <section className="flex flex-col gap-2 pb-8">
          <h2 className="bg-foreground text-background rounded-sm px-2 font-semibold">
            Conversations signalées
          </h2>
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
      {reportedUsers.length > 0 && (
        <section className="flex flex-col gap-2 pb-8">
          <h2 className="bg-foreground text-background rounded-sm px-2 font-semibold">
            Utilisateurs signalés
          </h2>
          <ul className="flex flex-col">
            {reportedUsers.map(
              ({ user, reportedMessageIds, reportedConversationIds }) => (
                <li
                  key={user.id}
                  className="relative flex flex-col border-b border-white px-4 py-2 first:border-t"
                >
                  <span className="font-semibold">{user.pseudo}</span>
                  <span className="text-xs text-neutral-400">
                    {`${reportedMessageIds.length + reportedConversationIds.length} signalement(s): ${reportedMessageIds.length} message(s), ${reportedConversationIds.length} conversation(s)`}
                  </span>
                  <BanUserTrigger
                    me={me}
                    user={user}
                    className="absolute right-4"
                  >
                    <button className="inline-flex items-center gap-1 rounded-sm border border-white px-2 py-0.5 text-xs hover:bg-white hover:text-black">
                      <Skull className="size-3" />
                      Bannir
                    </button>
                  </BanUserTrigger>
                </li>
              )
            )}
          </ul>
        </section>
      )}
      {bannedUsers.length > 0 && (
        <section className="flex flex-col gap-2 pb-8">
          <h2 className="bg-foreground text-background rounded-sm px-2 font-semibold">
            Utilisateurs bannis
          </h2>
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
