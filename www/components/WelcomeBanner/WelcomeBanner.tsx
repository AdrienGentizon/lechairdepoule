"use client";

import { useAuth } from "@clerk/nextjs";

import { useEffect, useRef } from "react";

import Link from "next/link";

import useMe from "@/lib/auth/useMe";
import useDismissedAt from "@/lib/misc/useDismissedAt";

import Button from "../Button/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

const LOCAL_STORAGE_KEY = "cdp-forum-banner-dismissed-at";

export default function WelcomeBanner() {
  const { me } = useMe();
  const { userId } = useAuth();
  const { dismissedAt, dismiss, reset } = useDismissedAt(LOCAL_STORAGE_KEY);

  const previousUserId = useRef(userId);

  useEffect(() => {
    if (previousUserId.current === null && userId) reset();
    previousUserId.current = userId;
  }, [userId, reset]);

  if (me && !me.pseudo) return null;
  if (dismissedAt) return null;

  return (
    <Dialog
      open={!dismissedAt}
      onOpenChange={(open) => {
        if (!open) dismiss();
      }}
    >
      <DialogContent
        aria-describedby="welcome-banner-description"
        className="border-purple-300"
      >
        <DialogHeader>
          <DialogTitle className="uppercase text-purple-300">
            Bienvenue sur le forum
          </DialogTitle>
        </DialogHeader>
        <div
          id="welcome-banner-description"
          className="flex flex-col gap-1 font-light"
        >
          <p>
            {`La consultation du `}
            <Link
              referrerPolicy="no-referrer"
              target="_blank"
              href={`/forum`}
              className="text-purple-300 underline"
            >
              forum
            </Link>{" "}
            {`et des agendas est totalement libre.`}
          </p>
          <p>
            {`Le partage de vos événements dans l'agenda `}
            <Link
              referrerPolicy="no-referrer"
              target="_blank"
              href={`/agenda`}
              className="text-purple-300 underline"
            >
              Hors les murs
            </Link>
            {` est aussi ouvert à tous.`}
          </p>
        </div>
        <div
          className="mx-auto h-px w-full border-b border-neutral-600"
          aria-hidden
        >
          &nbsp;
        </div>
        <div className="flex flex-col gap-3 font-light">
          <h3 className="text-sm font-semibold uppercase">
            Modération et inscription
          </h3>
          <p>{`Une équipe de volontaires est en place pour répondre à vos requêtes si vous constater des comportements inapropriés.`}</p>
          <p>
            {`Un simple email vous sera alors demandé pour:`}
            <ul className="list-inside list-disc pt-1">
              <li>{`Créer ou participer à une discussion.`}</li>
              <li>{`Partager et modifier vos événements.`}</li>
            </ul>
          </p>
        </div>
        <Link
          referrerPolicy="no-referrer"
          target="_blank"
          href="/forum/cgu"
          className="text-xs text-neutral-400 underline"
        >
          {`CGU`}
        </Link>
        <Button
          className="ml-auto"
          onClick={() => {
            dismiss();
          }}
        >
          Fermer
        </Button>
      </DialogContent>
    </Dialog>
  );
}
