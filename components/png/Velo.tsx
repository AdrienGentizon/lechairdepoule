import VeloPNG from "@/public/velo.png";
import Image, { ImageProps } from "next/image";

export default function Velo({ ...props }: Omit<ImageProps, "src" | "alt">) {
  return <Image src={VeloPNG} alt="Velo" {...props} />;
}
