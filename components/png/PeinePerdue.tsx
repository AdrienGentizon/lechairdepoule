import PeinePerduePNG from "@/public/peine-perdue.png";
import Image, { ImageProps } from "next/image";

export default function PeinePerdue({
  ...props
}: Omit<ImageProps, "src" | "alt">) {
  return <Image src={PeinePerduePNG} alt="logo Peine Perdue" {...props} />;
}
