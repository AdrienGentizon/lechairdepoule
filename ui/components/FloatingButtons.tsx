import { ReactNode } from "react";

export default function FloatingButtons({
  primary,
  secondary,
}: {
  primary?: ReactNode;
  secondary: ReactNode;
}) {
  return (
    <>
      {primary && (
        <div className="fixed right-4 top-4 z-20 flex items-center gap-2">
          {primary}
        </div>
      )}
      <div className="fixed left-4 top-4 z-20 flex items-center gap-2 landscape:bottom-4 landscape:left-auto landscape:right-4 landscape:top-auto">
        {secondary}
      </div>
    </>
  );
}
