import AmpoulePNG from "@/public/ampoule.png";
import Image, { ImageProps } from "next/image";

export default function Ampoule({ ...props }: Omit<ImageProps, "src" | "alt">) {
  return <Image src={AmpoulePNG} alt="Ampoule" {...props} />;
}
