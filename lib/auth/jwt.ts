"use server";

export async function verifyToken(jwt?: string): Promise<{
  id: string | null;
  email: string | null;
}> {
  console.log(jwt);

  return {
    id: null,
    email: null,
  };
}
