import { redirect } from "next/navigation";

// Password reset is handled inside Clerk's sign-in flow ("Forgot password?"
// on the /login page). This route is kept for backwards-compatible links and
// simply forwards to sign-in.
export default function ForgotPasswordPage() {
  redirect("/login");
}
