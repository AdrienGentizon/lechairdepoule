import contentful from "@/lib/contentful";
import { EntrySys, EntryFieldTypes } from "contentful";

type EventEntry = {
  contentTypeId: "event";
  sys: EntrySys;
  fields: {
    title: EntryFieldTypes.Text;
    shortDescription?: EntryFieldTypes.Text;
    message: EntryFieldTypes.Text;
    picture: EntryFieldTypes.AssetLink;
    date: EntryFieldTypes.Date;
  };
};

export default async function getEvents() {
  return (
    await contentful().getEntries<EventEntry>({
      content_type: "event",
    })
  ).items.sort((a, b) => {
    return (
      new Date(b.fields.date).getTime() - new Date(a.fields.date).getTime()
    );
  });
}

export type Event = Awaited<ReturnType<typeof getEvents>>[number];
