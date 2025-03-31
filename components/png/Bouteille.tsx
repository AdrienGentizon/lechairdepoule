import BouteillePNG from "@/public/bouteille.png";
import Image, { ImageProps } from "next/image";

export default function Bouteille({
  ...props
}: Omit<ImageProps, "src" | "alt">) {
  return <Image src={BouteillePNG} alt="Bouteille" {...props} />;
}
