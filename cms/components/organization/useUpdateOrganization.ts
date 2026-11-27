import { useMutation, useQueryClient } from "@tanstack/react-query";

import CustomError from "@cdp/lib/CustomError";

import { Me, Organization } from "@/lib/types";
import { OrganizationInput } from "@/lib/validation";

export default function useUpdateOrganization(organizationId: string) {
  const queryClient = useQueryClient();

  const {
    mutate: updateOrganization,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (inputs: OrganizationInput) => {
      const response = await fetch(`/api/organizations/${organizationId}`, {
        method: "PATCH",
        body: JSON.stringify(inputs),
      });

      if (!response.ok) throw await CustomError.fromResponse(response);

      return response.json() as Promise<Organization>;
    },
    onSuccess: (organization) => {
      queryClient.setQueryData<Me>(["me"], (prev) =>
        prev
          ? {
              ...prev,
              organizations: prev.organizations.map((previous) =>
                previous.id === organization.id ? organization : previous,
              ),
            }
          : prev,
      );
    },
  });

  return {
    updateOrganization,
    error,
    isPending,
  };
}
