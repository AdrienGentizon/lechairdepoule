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
        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Trigger render={<Button className="ml-auto" />}>
            <PlusCircleIcon size={18} aria-hidden />
            Créer une organisation
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>Créer une organisation</Dialog.Title>
            <OrganizationForm
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
      </PageHeader>
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
