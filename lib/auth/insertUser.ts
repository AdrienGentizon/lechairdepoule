import sql from "../db";

export default async function insertUser({
  email,
  pseudo,
}: {
  email: string;
  pseudo: string;
}) {
  return (
    await sql<
      {
        id: string;
        email: string;
        pseudo: string;
      }[]
    >`INSERT INTO public.users (email, pseudo)
        VALUES(${email}, ${pseudo})
        RETURNING id::text, email, pseudo;`
  ).at(0);
}
