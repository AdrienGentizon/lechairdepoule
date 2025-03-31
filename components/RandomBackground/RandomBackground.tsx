"use client";

import { useEffect, useState } from "react";
import Velo from "../png/Velo";
import Pinball from "../png/Pinball";
import Bouteille from "../png/Bouteille";
import Goblet from "../png/Goblet";
import Poubelle from "../png/Poubelle";
import Ampoule from "../png/Ampoule";
import { usePathname } from "next/navigation";

const CELL_HEIGHT = 224; // h-56
const WINDOW_PADDING = -50;
const COLS = 9;

function getRandomPNG() {
  const random = Math.random();
  if (random < 0.025) return <Pinball />;
  if (random < 0.075) return <Poubelle />;
  if (random < 0.3) return <Bouteille />;
  if (random < 0.4) return <Goblet />;
  if (random < 0.5) return <Velo />;
  if (random < 0.75) return <Ampoule />;
  return <></>;
}

function makeCells(length: number) {
  const cols = Array.from({ length: COLS });
  const rows = Array.from({
    length: Math.floor((length - 2 * WINDOW_PADDING) / CELL_HEIGHT),
  });

  return rows.map((row, r) => {
    return cols.map((col, c) => {
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
        png: getRandomPNG(),
      };
    });
  });
}

export default function RandomBackground() {
  const [cells, setCells] = useState(makeCells(0));
  const pathname = usePathname();

  useEffect(() => {
    const abortController = new AbortController();
    setCells(makeCells(document.body.scrollHeight));
    window.addEventListener("event:select", () => {
      const cells = makeCells(document.body.scrollHeight);
      setCells((prev) => {
        return [...prev, ...cells.slice(prev.length)];
      });
    });

    return () => {
      abortController.abort();
    };
  }, [pathname]);

  if (process.env["NEXT_PUBLIC_SHOW_RANDOM_BACKGROUND"] !== "true")
    return <></>;

  return (
    <div
      className="absolute left-[-50px] right-[-50px] top-[-50px] -z-10 grid overflow-hidden"
      style={{
        gridRow: COLS,
      }}
    >
      {cells.map((rows, n) => {
        return (
          <ul key={`row-${n}`} className="hidden h-56 grid-cols-9 sm:grid">
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
                  {cell.hidden ? <></> : <>{cell.png}</>}
                </li>
              );
            })}
          </ul>
        );
      })}
    </div>
  );
}
