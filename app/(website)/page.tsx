import contentful from "@/lib/contentful";
import { Asset, AssetFile, EntryFieldTypes, EntrySys } from "contentful";
import Image from "next/image";

type EventEntry = {
  contentTypeId: "event";
  sys: EntrySys;
  fields: {
    title: EntryFieldTypes.Text;
    message: EntryFieldTypes.Text;
    picture: EntryFieldTypes.AssetLink;
    date: EntryFieldTypes.Date;
  };
};

export default async function Home() {
  const events = await contentful().getEntries<EventEntry>({
    content_type: "event",
  });

  return (
    <ul>
      {events.items.map((item) => {
        return (
          <li key={`item-${item.sys.id}`} className="flex flex-col gap-2 p-2">
            <header className="inline-flex items-center justify-between">
              <h2 className="text-xl font-semibold">{item.fields.title}</h2>
              <span className="text-sm font-light">
                {new Date(item.fields.date).toDateString()}
              </span>
            </header>
            <Image
              className="rounded"
              alt=""
              src={`https:${
                (item.fields.picture as Asset)?.fields.file?.url?.toString() ??
                ""
              }`}
              width={
                ((item.fields.picture as Asset)?.fields.file as AssetFile)
                  ?.details?.image?.width
              }
              height={
                ((item.fields.picture as Asset)?.fields.file as AssetFile)
                  ?.details?.image?.height
              }
            />
            <div className="flex flex-col gap-2 pb-4 text-justify font-light leading-5">
              {item.fields.message.split("\n").map((p, n) => {
                return <p key={`item-${item.sys.id}-p-${n}`}>{p}</p>;
              })}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
