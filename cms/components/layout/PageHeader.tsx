import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

import { ReactNode } from "react";

import Link from "next/link";

export default function PageHeader({
  heading,
  subHeading,
  children,
  navBack,
}: {
  heading: ReactNode;
  subHeading?: ReactNode;
  children?: ReactNode;
  navBack?: { href: string; label: string; landmarkLabel: string };
}) {
  return (
    <header className="inline-flex items-center gap-4">
      {navBack && (
        <nav aria-label={navBack.landmarkLabel}>
          <Link href={navBack.href}>
            <ArrowLeftIcon size={24} aria-hidden />
            <span className="sr-only">{navBack.label}</span>
          </Link>
        </nav>
      )}
      <div className="mr-auto">
        <h1 className="text-2xl font-thin uppercase">{heading}</h1>
        {subHeading}
      </div>
      {children}
    </header>
  );
}
