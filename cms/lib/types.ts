import { User } from "@cdp/lib/types";

export type Organization = {
  id: string;
  type: "VENUE" | "BAND" | "ARTIST" | "BOOKER" | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  country: string;
  zipcode: string;
  city: string;
  street: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Me = User & { organizations: Organization[] };
