import SignInForm from "@/lib/components/auth/SignInForm";

export default async function LoginPage() {
  return (
    <main id="main" className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-thin uppercase">Login</h1>
      <SignInForm />
    </main>
  );
}
