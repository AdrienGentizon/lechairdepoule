import Image, { ImageProps } from "next/image";

import ChaitDePoulsPNG from "@/public/chair-de-poule.png";

export default function ChairDePoule({
  ...props
}: Omit<ImageProps, "src" | "alt">) {
  return <Image src={ChaitDePoulsPNG} alt="logo Chair de Poule" {...props} />;
}
