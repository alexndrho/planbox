import AppContainer from "@/components/AppContainer";
import { auth } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return <AppContainer user={session?.user}>{children}</AppContainer>;
}
