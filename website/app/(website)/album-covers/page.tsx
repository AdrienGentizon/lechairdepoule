import { notFound } from "next/navigation";

import ContentfulImage from "@/components/ContentfulImage";
import getAlbumCovers from "@/queries/getAlbumCovers";

export const revalidate = 86400;

const IMAGE_SIZES = [
  "(orientation: landscape) and (min-width: 672px) 224px",
  "(orientation: landscape) 33vw",
  "100vw",
].join(", ");

function getLoadingProps(index: number) {
  const isLargestContentfulPaint = index === 0;
  if (isLargestContentfulPaint) {
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
      <ul className="grid h-min grid-cols-1 gap-0 landscape:grid-cols-3">
        {albumCovers.map((albumCover, index) => {
          return (
            <li
              key={albumCover.sys.id}
              className="flex items-center justify-center"
            >
              <ContentfulImage
                src={albumCover.picture.url}
                alt={`${albumCover.title} remake`}
                width={albumCover.picture.width}
                height={albumCover.picture.height}
                sizes={IMAGE_SIZES}
                {...getLoadingProps(index)}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}
