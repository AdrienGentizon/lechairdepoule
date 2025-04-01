import BlasonPNG from "@/public/blason.png";
import Image, { ImageProps } from "next/image";

export default function Blason({ ...props }: Omit<ImageProps, "src" | "alt">) {
  return <Image src={BlasonPNG} alt="Blason" {...props} />;
}
