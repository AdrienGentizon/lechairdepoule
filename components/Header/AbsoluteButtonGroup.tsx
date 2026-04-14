import { ReactNode } from "react";

export default function AbsoluteButtonGroup({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
      {children}
    </div>
  );
}
