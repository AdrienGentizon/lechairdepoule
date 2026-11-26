import OrganizationPage from "@/components/pages/OrganizationPage";

export default async function Organization({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;

  return <OrganizationPage organizationId={organizationId} />;
}
