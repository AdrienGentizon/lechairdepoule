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

type ExpectedDate =
  `${number}-${number}-${number}T${number}:${number}:${number}Z`;

export default async function getEvents() {
  const date = new Date();
  const monthFirstDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthLastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return (
    await contentful().getEntries<EventEntry>({
      content_type: "event",
      "fields.date[gte]": monthFirstDate.toISOString() as ExpectedDate,
      "fields.date[lte]": monthLastDate.toISOString() as ExpectedDate,
    })
  ).items.sort((a, b) => {
    return (
      new Date(b.fields.date).getTime() - new Date(a.fields.date).getTime()
    );
  });
}

export type Event = Awaited<ReturnType<typeof getEvents>>[number];
