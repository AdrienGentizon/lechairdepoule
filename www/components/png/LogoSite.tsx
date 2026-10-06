import Image from "next/image";

import LogoPNG from "@/public/logo.png";

export default function LogoSite() {
  return (
    <Image
      src={LogoPNG}
      alt="logo Chair de Poule"
      priority
      className="mx-auto w-1/2 pb-2 pt-4"
      sizes="(max-width: 640px) 50dvw, 320px"
    />
  );
}
