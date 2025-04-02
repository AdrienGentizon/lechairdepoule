"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const CELL_HEIGHT = 224; // h-56
const WINDOW_PADDING = -50;
const COLS = 9;
const ROWS_SAFE_FACTOR =
  process.env["NEXT_PUBLIC_USE_SCROLL_TO"] === "true" ? 2 : 5;

type Asset = {
  sys: {
    id: string;
  };
  url: string;
  width: number;
  height: number;
};

type Cell = {
  id: string;
  scale: number;
  translateX: number;
  translateY: number;
  flip: boolean;
  hidden: boolean;
  png: Asset | undefined;
};

const Ampoule = {
  id: "4fcHEsDLc09IDrP8gHde8i",
};
const Platines = {
  id: "4WlTM4g1pJCMTE1aYFp1eY",
};
const Bouteille = {
  id: "UBD7ZDOvihNi0RRyOVDWL",
};
const Gobelet = {
  id: "01xNZTTrvJzSrfAPAlar0R",
};
const Pinball = {
  id: "6D6vJ31IuV0sJ2Mu7GamX4",
};
const Blason = {
  id: "4FEs8T25KAWvnBJa5kL8f5",
};
const Velo = {
  id: "2vyMsKStYB93wZmoVxV2YR",
};
const Poubelle = {
  id: "27Iyxov9VRIRicNHaOVTT5",
};

function getRandomPNG(assets: Asset[]) {
  const random = Math.random();
  if (random < 0.0125) return assets.find(({ sys }) => sys.id === Poubelle.id);
  if (random < 0.025) return assets.find(({ sys }) => sys.id === Gobelet.id);
  if (random < 0.05) return assets.find(({ sys }) => sys.id === Bouteille.id);
  if (random < 0.075) return assets.find(({ sys }) => sys.id === Blason.id);
  if (random < 0.1) return assets.find(({ sys }) => sys.id === Velo.id);
  if (random < 0.3) return assets.find(({ sys }) => sys.id === Platines.id);
  if (random < 0.4) return assets.find(({ sys }) => sys.id === Pinball.id);
  if (random < 0.75) return assets.find(({ sys }) => sys.id === Ampoule.id);
  return;
}

function makeCells(length: number, assets: Asset[]) {
  const cols = Array.from({ length: COLS });
  const rows = Array.from({
    length:
      ROWS_SAFE_FACTOR *
      Math.floor((length - 2 * WINDOW_PADDING) / CELL_HEIGHT),
  });

  return rows.map((_row, r) => {
    return cols.map((_col, c) => {
      return {
        id: `row-${r}-$col-${c}`,
        scale: Math.max(0.5, Math.min(Math.random(), 0.75)),
        translateX:
          Math.random() > 0.5
            ? Math.floor(50 * Math.random())
            : -1 * Math.floor(50 * Math.random()),
        translateY:
          Math.random() > 0.5
            ? Math.floor(50 * Math.random())
            : -1 * Math.floor(50 * Math.random()),
        flip: Math.random() > 0.5,
        hidden: c > 2 && c < 6,
        png: getRandomPNG(assets),
      };
    });
  });
}

type Props = {
  assets: Asset[];
};

export default function RandomBackground({ assets }: Props) {
  const [cells, setCells] = useState<Cell[][]>(makeCells(0, assets));
  const [maxHeight, setMaxheight] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const abortController = new AbortController();
    setCells(makeCells(document.body.scrollHeight, assets));
    setMaxheight(document.body.scrollHeight);
    window.addEventListener(
      "body:scrollHeight",
      (e: CustomEventInit<{ scrollHeight: number }>) => {
        if (!e.detail?.scrollHeight) return;
        setMaxheight(e.detail.scrollHeight);
      },
      abortController,
    );

    return () => {
      abortController.abort();
    };
  }, [pathname, assets]);

  if (process.env["NEXT_PUBLIC_SHOW_RANDOM_BACKGROUND"] !== "true")
    return <></>;

  return (
    <div
      style={{
        maxHeight: maxHeight + 2 * -WINDOW_PADDING,
      }}
      className="absolute left-[-112px] right-[-112px] top-[-112px] -z-10 hidden overflow-hidden sm:block"
    >
      {cells.map((rows, n) => {
        return (
          <ul
            key={`row-${n}`}
            className="hidden h-56 min-h-56 grid-cols-9 sm:grid"
            style={{
              gridRow: COLS,
            }}
          >
            {rows.map((cell) => {
              return (
                <li
                  key={`cell-${cell.id}`}
                  className=""
                  style={{
                    scale: cell.scale,
                    transform: cell.flip ? "scaleX(-1)" : undefined,
                    translate: `${cell.translateX}px ${cell.translateY}px`,
                  }}
                >
                  {cell.hidden || !cell.png ? (
                    <></>
                  ) : (
                    <Image
                      src={cell.png.url}
                      width={cell.png.width}
                      height={cell.png.height}
                      alt="drawings"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        );
      })}
    </div>
  );
}
