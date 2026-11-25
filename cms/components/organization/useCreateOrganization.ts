import { useMutation, useQueryClient } from "@tanstack/react-query";

import CustomError from "@cdp/lib/CustomError";

import { Me, Organization } from "@/lib/types";
import { OrganizationInput } from "@/lib/validation";

export default function useCreateOrganization(options?: {
  onSuccess?: (organization: Organization) => void;
}) {
  const queryClient = useQueryClient();

  const {
    mutate: createOrganization,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (inputs: OrganizationInput) => {
      const response = await fetch(`/api/organizations`, {
        method: "POST",
        body: JSON.stringify(inputs),
      });

      if (!response.ok) throw await CustomError.fromResponse(response);

      return response.json() as Promise<Organization>;
    },
    onSuccess: (organization) => {
      queryClient.setQueryData<Organization[]>(["organizations"], (prev) =>
        prev ? [organization, ...prev] : prev,
      );
      queryClient.setQueryData<Me>(["me"], (prev) =>
        prev
          ? { ...prev, organizations: [organization, ...prev.organizations] }
          : prev,
      );
      options?.onSuccess?.(organization);
    },
  });

  return {
    createOrganization,
    error,
    isPending,
  };
}
