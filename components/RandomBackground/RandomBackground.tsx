"use client";

import { useState } from "react";
import Velo from "../png/Velo";
import FeuTricolore from "../png/FeuTricolore";
import Pinball from "../png/Pinball";

const COLS = 9;

function getRandomPNG() {
  const random = Math.random();
  if (random < 0.01) return <FeuTricolore />;
  if (random < 0.02) return <Pinball />;
  if (random < 0.3) return <Velo />;
  return <></>;
}

function makeCells(length: number) {
  const cols = Array.from({ length: COLS });
  const rows = Array.from({ length });

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

  if (process.env["NEXT_PUBLIC_SHOW_RANDOM_BACKGROUND"] !== "true")
    return <></>;

  return (
    <div
      ref={(el) => {
        if (!el) return;

        if (cells.length === 0) {
          setCells(
            makeCells(
              Math.floor((el?.getBoundingClientRect().height ?? 0) / 100),
            ),
          );
        }
      }}
      className="hidden absolute inset-[-50px] -z-10 sm:grid"
      style={{
        gridRow: COLS,
      }}
    >
      {cells.map((rows, n) => {
        return (
          <ul key={`row-${n}`} className="grid grid-cols-9">
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
