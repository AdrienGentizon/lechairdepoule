import PinballPNG from "@/public/pinball.png";
import Image, { ImageProps } from "next/image";

export default function Pinball({ ...props }: Omit<ImageProps, "src" | "alt">) {
  return <Image src={PinballPNG} alt="Velo" {...props} />;
}
