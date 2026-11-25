"use client";

import { ReactNode } from "react";

import { ALLOWED_IMAGE_TYPES } from "@cdp/lib/file";

import cn from "../lib/cn";

const FILE_INPUT_ACCEPT = ALLOWED_IMAGE_TYPES.flatMap(
  ({ mime, extensions }) => [...extensions, mime],
).join(",");

export default function UploadFileButton({
  className,
  title,
  children,
  isPending,
  "aria-describedby": ariaDescribedby,
  uploadFile,
}: {
  className?: string;
  title?: string;
  children: ReactNode;
  isPending?: boolean;
  "aria-describedby"?: string;
  uploadFile: (file: File) => void;
}) {
  return (
    <label
      title={title}
      className={cn(
        "cursor-pointer",
        className,
        isPending && "cursor-default opacity-50",
      )}
    >
      {children}
      <input
        type="file"
        className="sr-only"
        accept={FILE_INPUT_ACCEPT}
        disabled={isPending}
        aria-describedby={ariaDescribedby}
        onChange={(e) => {
          const file = e.target.files?.item(0);
          e.target.value = "";
          if (!file) return;
          uploadFile(file);
        }}
      />
    </label>
  );
}
