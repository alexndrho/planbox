import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ServerRedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/home");
  }

  return <>{children}</>;
}
