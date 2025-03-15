import ChaitDePoulsPNG from "@/public/chair-de-poule.png";
import Image, { ImageProps } from "next/image";

export default function ChairDePoule({
  ...props
}: Omit<ImageProps, "src" | "alt">) {
  return <Image src={ChaitDePoulsPNG} alt="logo Chair de Poule" {...props} />;
}
