import Button from "@cdp/ui/Button";

import signOut from "@/actions/auth/signOut";

export default function SignOutButton() {
  return (
    <Button type="button" variant="danger" onClick={signOut}>
      Log out
    </Button>
  );
}
