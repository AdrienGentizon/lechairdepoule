"use client";

import { PlusCircleIcon } from "@phosphor-icons/react";

import { useState } from "react";

import Link from "next/link";

import Button from "@cdp/ui/Button";
import Dialog from "@cdp/ui/Dialog";
import Table from "@cdp/ui/Table";

import useMe from "@/components/auth/useMe";
import Main from "@/components/layout/Main";
import OrganizationForm from "@/components/organization/OrganizationForm";
import useCreateOrganization from "@/components/organization/useCreateOrganization";

export default function HomePage() {
  const { me } = useMe();
  const { createOrganization, isPending } = useCreateOrganization();

  const [open, setOpen] = useState(false);

  if (!me) return null;

  return (
    <Main>
      <header className="inline-flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Trigger render={Button}>
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
      </header>
      <Table>
        <Table.Caption>Organizations</Table.Caption>
        <Table.THead>
          <Table.TR>
            <Table.TH>name</Table.TH>
            <Table.TH>type</Table.TH>
          </Table.TR>
        </Table.THead>
        <Table.TBody>
          {me.organizations.map((organization) => {
            return (
              <Table.TR key={organization.id}>
                <Table.TD>
                  <Link href={`/organizations/${organization.id}`}>
                    {organization.name}
                  </Link>
                </Table.TD>
                <Table.TD>{organization.type}</Table.TD>
              </Table.TR>
            );
          })}
        </Table.TBody>
      </Table>
    </Main>
  );
}
