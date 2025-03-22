import { cn } from "@/lib/utils";
import getItems from "@/queries/getItems";
import Image from "next/image";

export default async function DrugstorePage() {
  const items = await getItems();

  return (
    <ul className="flex flex-col items-center justify-center gap-4">
      {items.map((item) => {
        return (
          <li key={item.sys.id} className="w-fit">
            <h2 className="w-full py-2 text-center text-2xl font-thin">
              {item.name}
            </h2>
            {item.picturesCollection.items.map((picture) => {
              return (
                <div key={picture.sys.id} className="relative -z-10 w-fit">
                  <Image
                    src={picture.url}
                    width={picture.width}
                    height={picture.height}
                    alt={`${item.name}`}
                  />
                  {item.soldOut && (
                    <div className="absolute inset-0 bg-black opacity-50" />
                  )}
                  <div
                    className={cn(
                      "absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 rotate-45 bg-black px-16 pb-4 pt-32 text-center text-3xl font-bold uppercase",
                    )}
                  >
                    {item.price}
                    <em className="font-thin">&euro;</em>
                  </div>
                </div>
              );
            })}
          </li>
        );
      })}
    </ul>
  );
}
