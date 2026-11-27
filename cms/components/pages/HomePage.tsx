"use client";

import { ArrowRightIcon, PlusCircleIcon } from "@phosphor-icons/react";

import { useState } from "react";

import Link from "next/link";

import dictionaries from "@cdp/lib/i18n/dictionaries/pages";
import Button from "@cdp/ui/Button";
import Dialog from "@cdp/ui/Dialog";

import useMe from "@/components/auth/useMe";
import useT from "@/components/i18n/useT";
import Main from "@/components/layout/Main";
import PageHeader from "@/components/layout/PageHeader";
import OrganizationForm from "@/components/organization/OrganizationForm";
import useCreateOrganization from "@/components/organization/useCreateOrganization";

export default function HomePage() {
  const dictionary = useT(dictionaries);
  const { me } = useMe();
  const { createOrganization, isPending } = useCreateOrganization();

  const [open, setOpen] = useState(false);

  if (!me) return null;

  return (
    <Main>
      <PageHeader heading={dictionary.organizations_h1}>
        {me.organizations.length > 0 && (
          <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Trigger render={<Button className="ml-auto" />}>
              <PlusCircleIcon size={18} aria-hidden />
              {dictionary.organization_create}
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Title>{dictionary.organization_create}</Dialog.Title>
              <OrganizationForm
                submitLabel={dictionary.organization_activate}
                isPending={isPending}
                onSubmit={(inputs) => {
                  createOrganization(inputs, {
                    onSuccess: () => {
                      setOpen(false);
                    },
                  });
                }}
              />
            </Dialog.Content>
          </Dialog>
        )}
      </PageHeader>
      {me.organizations.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {dictionary.organizations_empty_heading}
            </h2>
            <p className="max-w-sm text-balance text-center text-neutral-100">
              {dictionary.organizations_empty}
            </p>
          </div>
          <div className="w-full max-w-sm">
            <OrganizationForm
              submitLabel={dictionary.organization_activate}
              isPending={isPending}
              onSubmit={(inputs) => createOrganization(inputs)}
            />
          </div>
        </div>
      )}
      <ul
        role="list"
        className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4"
      >
        {me.organizations.map((organization) => {
          return (
            <li
              key={organization.id}
              className="has-focus-visible:outline-2 has-focus-visible:outline-offset-2 relative h-full min-h-32 rounded bg-neutral-50 p-4 text-neutral-900"
            >
              <h2 className="font-medium">
                <Link
                  href={`/organizations/${organization.id}`}
                  className="outline-none after:absolute after:inset-0"
                >
                  {organization.name}
                </Link>
              </h2>
              <p className="text-sm lowercase text-neutral-500">
                {organization.type}
              </p>
              <ArrowRightIcon
                size={24}
                className="absolute bottom-4 right-4"
                aria-hidden
              />
            </li>
          );
        })}
      </ul>
    </Main>
  );
}
