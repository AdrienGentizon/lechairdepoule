import PlatinesPNG from "@/public/platines.png";
import Image, { ImageProps } from "next/image";

export default function Platines({
  ...props
}: Omit<ImageProps, "src" | "alt">) {
  return <Image src={PlatinesPNG} alt="Platines" {...props} />;
}
