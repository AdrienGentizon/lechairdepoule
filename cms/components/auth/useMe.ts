import { useQuery } from "@tanstack/react-query";

import { Me } from "@/lib/types";

export default function useMe() {
  const {
    data: me,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await fetch(`/api/me`, {
        method: "GET",
      });

      if (response.status === 401) return null;
      if (!response.ok) throw new Error(`/api/me ${response.status}`);

      return response.json() as Promise<Me>;
    },
  });

  return {
    me,
    isFetching,
    error,
  };
}
