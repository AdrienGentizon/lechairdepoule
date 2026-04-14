import Image, { ImageLoaderProps, ImageProps } from "next/image";

function contentfulLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("w", width.toString());
  url.searchParams.set("q", (quality ?? 75).toString());
  url.searchParams.set("fm", "webp");
  return url.toString();
}

export default function ContentfulImage({ alt, ...props }: ImageProps) {
  return <Image loader={contentfulLoader} alt={alt} {...props} />;
}
