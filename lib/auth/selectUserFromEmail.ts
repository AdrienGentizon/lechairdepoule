import sql from "../db";

export default async function selectUserFromEmail(email: string) {
  return (
    await sql<
      {
        id: string;
        email: string;
        pseudo: string;
      }[]
    >`SELECT id::text, email, pseudo FROM public.users WHERE email=${email}`
  ).at(0);
}
