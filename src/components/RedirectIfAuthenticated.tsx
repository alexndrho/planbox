"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const { push } = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.data?.user) {
      push("/");
    }
  }, [session.data?.user, push]);

  return <>{children}</>;
}
