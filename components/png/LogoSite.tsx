import Image, { ImageProps } from "next/image";

import LogoPNG from "@/public/logo.png";

export default function LogoSite({
  ...props
}: Omit<ImageProps, "src" | "alt">) {
  return <Image src={LogoPNG} alt="logo Chair de Poule" priority {...props} />;
}
