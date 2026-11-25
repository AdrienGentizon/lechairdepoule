import OrganizationPage from "@/components/pages/OrganizationPage";

export default async function Organization({
  params,
}: PageProps<"/organizations/[organizationId]">) {
  const { organizationId } = await params;

  return <OrganizationPage organizationId={organizationId} />;
}
