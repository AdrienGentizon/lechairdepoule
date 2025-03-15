import LogoPNG from "@/public/logo.png";
import Image, { ImageProps } from "next/image";

export default function Logo({ ...props }: Omit<ImageProps, "src" | "alt">) {
  return <Image src={LogoPNG} alt="logo Chair de Poule" {...props} />;
}
