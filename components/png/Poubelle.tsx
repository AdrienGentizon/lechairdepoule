import PoubellePNG from "@/public/poubelle.png";
import Image, { ImageProps } from "next/image";

export default function Poubelle({
  ...props
}: Omit<ImageProps, "src" | "alt">) {
  return <Image src={PoubellePNG} alt="Poubelle" {...props} />;
}
