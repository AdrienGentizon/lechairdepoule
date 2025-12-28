"use client";

import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";

import { TextareaHTMLAttributes, useState } from "react";

import useSearchSimilarUsersByPseudo from "@/lib/auth/useSearchSimilarUsersByPseudo";
import useDebounce from "@/lib/misc/useDebounce";
import { User } from "@/lib/types";

type MentionUser = Pick<User, "id" | "pseudo">;

const Item = ({ entity }: { entity: MentionUser }) => (
  <div className="cursor-pointer truncate border-b border-neutral-100 px-2 py-2 text-black hover:bg-gray-100">
    {entity.pseudo}
  </div>
);

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function MessageAugementedTextarea(props: Props) {
  const [search, setSearch] = useState("");
  const { similarUsers } = useSearchSimilarUsersByPseudo(search);
  const debounceSearch = useDebounce(setSearch, 500);
  const dataProvider = (token: string): MentionUser[] => {
    debounceSearch(token);
    return (similarUsers || []).map(({ id, pseudo }) => ({ id, pseudo }));
  };

  return (
    <ReactTextareaAutocomplete<MentionUser>
      loadingComponent={() => <></>}
      minChar={2}
      dropdownStyle={{
        position: "absolute",
        zIndex: 50,
        background: "white",
        border: "solid 1px black",
        borderRadius: 4,
        maxHeight: "8rem",
        maxWidth: "10rem",
        width: "100%",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflowY: "scroll",
        transform: `translate(0, calc(-100% - 1rem))`,
      }}
      containerClassName="relative"
      trigger={{
        "@": {
          dataProvider,
          component: Item,
          output: (item: MentionUser) => `@${item.pseudo}`,
        },
      }}
      {...props}
    />
  );
}
