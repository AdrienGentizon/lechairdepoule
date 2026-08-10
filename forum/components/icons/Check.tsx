import { SVGAttributes } from "react";

export default function Check({
  fill,
  stroke,
  strokeWidth,
  ...props
}: SVGAttributes<SVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill={fill ?? "currentColor"}
      stroke={stroke ?? "currentColor"}
      viewBox="0 0 256 256"
      {...props}
    >
      <polyline
        points="40 144 96 200 224 72"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth ?? 16}
      />
    </svg>
  );
}
