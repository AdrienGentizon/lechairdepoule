import { fetchCollectionGraphQL } from "@/lib/contentful";

type Picture = {
  sys: {
    id: string;
  };
  url: string;
  width: number;
  height: number;
  title: string;
  description: string | null;
};

type RawAlbumCover = {
  sys: { id: string };
  title: string;
  picture: Picture | null;
};

export type AlbumCover = RawAlbumCover & { picture: Picture };

const PAGE_SIZE = 100;

async function fetchAlbumCoversPage(skip: number) {
  const collection = (
    await fetchCollectionGraphQL<RawAlbumCover>(
      "albumCoverCollection",
      `query {
      albumCoverCollection(skip: ${skip}, limit: ${PAGE_SIZE}, order: [sys_firstPublishedAt_DESC, sys_id_ASC]) {
        total
        items {
          sys {
            id
          }
          title
          picture {
            sys {
              id
            }
            url
            width
            height
            title
            description
          }
        }
      }
    }`,
    )
  )?.data?.albumCoverCollection;

  return {
    items: collection?.items ?? [],
    total: collection?.total ?? 0,
  };
}

function hasPicture(cover: RawAlbumCover): cover is AlbumCover {
  return cover.picture !== null;
}

function getRemainingSkips(total: number) {
  const remainingPageCount = Math.max(Math.ceil(total / PAGE_SIZE) - 1, 0);
  return Array.from(
    { length: remainingPageCount },
    (_, index) => (index + 1) * PAGE_SIZE,
  );
}

export default async function getAlbumCovers() {
  const firstPage = await fetchAlbumCoversPage(0);
  const remainingPages = await Promise.all(
    getRemainingSkips(firstPage.total).map(fetchAlbumCoversPage),
  );
  return [firstPage, ...remainingPages]
    .flatMap((page) => page.items)
    .filter(hasPicture);
}
