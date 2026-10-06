import { notFound } from "next/navigation";

import ContentfulImage from "@/components/ContentfulImage";
import { cn } from "@/lib/utils";
import getAlbumCovers from "@/queries/getAlbumCovers";

export const revalidate = 86400;

const IMAGE_SIZES = [
  "(orientation: landscape) and (min-width: 672px) 224px",
  "(orientation: landscape) 33vw",
  "100vw",
].join(", ");

const FIRST_CHILD_IMAGE_SIZES = "(min-width: 672px) 672px, 100vw";

function getLoadingProps(isFirstChild: boolean) {
  if (isFirstChild) {
    return { loading: "eager", fetchPriority: "high" } as const;
  }
  return { loading: "lazy" } as const;
}

export default async function AlbumCoversPage() {
  if (process.env.NODE_ENV !== "development") return notFound();

  const albumCovers = await getAlbumCovers();

  return (
    <>
      <h1 className="sr-only">Pochettes d&apos;albums</h1>
      <div className="mask-fade-y overflow-y-auto py-5">
        <ul className="grid h-min grid-cols-1 gap-0 landscape:grid-cols-3">
          {albumCovers.map((albumCover, n) => {
            const isFirstChild = n === 0;
            return (
              <li
                key={albumCover.sys.id}
                className={cn(
                  "flex items-center justify-center",
                  isFirstChild && "col-span-full",
                )}
              >
                <ContentfulImage
                  src={albumCover.picture.url}
                  alt={`${albumCover.title} remake`}
                  width={albumCover.picture.width}
                  height={albumCover.picture.height}
                  sizes={isFirstChild ? FIRST_CHILD_IMAGE_SIZES : IMAGE_SIZES}
                  {...getLoadingProps(isFirstChild)}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
