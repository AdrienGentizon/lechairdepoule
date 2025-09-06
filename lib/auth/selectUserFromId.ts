import sql from "../db";

export default async function selectUserFromId(id: string) {
  return (
    await sql<
      {
        id: string;
        email: string;
        pseudo: string;
      }[]
    >`SELECT id::text, email, pseudo FROM public.users WHERE id=${id}`
  ).at(0);
}
