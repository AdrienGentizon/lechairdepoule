import GobletPNG from "@/public/goblet.png";
import Image, { ImageProps } from "next/image";

export default function Goblet({ ...props }: Omit<ImageProps, "src" | "alt">) {
  return <Image src={GobletPNG} alt="Bouteille" {...props} />;
}
