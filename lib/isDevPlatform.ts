export default function isDevPlatform() {
  return (
    process.env["NEXT_PUBLIC_VERCEL_ENV"] !== "production" ||
    process.env.NODE_ENV === "development"
  );
}
