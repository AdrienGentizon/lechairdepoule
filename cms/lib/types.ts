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

export type Event = {
  id: string;
  type: "EVENT" | "RELEASE";
  title: string;
  description: string | null;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  startDate: string;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  timezone: string;
  price: string | null;
  venue: string | null;
  url: string | null;
  visibility: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Me = User & { organizations: Organization[] };
