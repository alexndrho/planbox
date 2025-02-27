"use client";

import AppContainer from "@/components/AppContainer";
import { useSession } from "next-auth/react";

export default function Home() {
  const session = useSession();

  return <AppContainer user={session.data?.user}></AppContainer>;
}
