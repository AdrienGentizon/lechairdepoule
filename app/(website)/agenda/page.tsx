import { unstable_cache } from "next/cache";

import PublicEventsList from "@/components/PublicEventsList/PublicEventsList";
import RefreshOnFocus from "@/components/RefreshOnFocus/RefreshOnFocus";
import selectConversationsByTypes from "@/lib/forum/selectConversationsByTypes";
import { getLogger } from "@/lib/logger";

const getCachedAgendaConversations = unstable_cache(
  async () => {
    const logger = getLogger("getAgendaConversations");
    try {
      const conversations = await selectConversationsByTypes(
        ["EVENT", "RELEASE"],
        new Date()
      );
      logger.append(`${conversations.length}x conversation(s) selected`);
      logger.flush();
      return conversations;
    } catch (error) {
      logger.withError(error).flush();
      return [];
    }
  },
  ["cachedAgenda"],
  { tags: ["cachedAgenda"], revalidate: 43200 }
);

export default async function AgendaPage() {
  const conversations = await getCachedAgendaConversations();

  return (
    <div className="grid grid-cols-1 grid-rows-1 overflow-hidden">
      <h1 className="sr-only">Agenda hors les murs</h1>
      <PublicEventsList conversations={conversations} />
      <RefreshOnFocus />
    </div>
  );
}
