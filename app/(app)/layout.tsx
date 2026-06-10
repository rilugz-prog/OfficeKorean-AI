import { requireProfile } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { UpgradeModalProvider } from "@/components/upgrade-modal";

// All routes under (app) are protected. The middleware redirects unauthenticated
// users, and requireProfile() is a defensive server-side double check.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireProfile();

  return (
    <UpgradeModalProvider>
      <AppShell profile={profile}>{children}</AppShell>
    </UpgradeModalProvider>
  );
}
