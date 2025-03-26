import FeuTricolorePNG from "@/public/feu-tricolore.png";
import Image, { ImageProps } from "next/image";

export default function FeuTricolore({
  ...props
}: Omit<ImageProps, "src" | "alt">) {
  return <Image src={FeuTricolorePNG} alt="Feu tricolore" {...props} />;
}
