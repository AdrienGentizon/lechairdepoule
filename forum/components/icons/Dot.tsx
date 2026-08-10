import { SVGAttributes } from "react";

export default function Dot({
  fill,
  stroke,
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
      <circle cx="128" cy="128" r="12" />
    </svg>
  );
}
