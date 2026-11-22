import { redirect } from "next/navigation";

import AdminPage from "@/components/Admin/AdminPage";
import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";

export default async function Page() {
  const user = await getAuthenticatedUser();

  if (!user || user.bannedAt || user.role !== "admin") redirect("/forum");

  return <AdminPage />;
}
