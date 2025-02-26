"use client";

import { useSession } from "next-auth/react";

export default function Home() {
  const session = useSession();

  return (
    <div className="container min-h-dvh mx-auto px-4">
      {session.data?.user && (
        <div className="container min-h-dvh mx-auto px-4">
          Good day {session.data.user.email}
        </div>
      )}
    </div>
  );
}
