"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import getMyUserInfo from "@/services/user";
import { useQuery } from "@tanstack/react-query";

export default function Settings() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getMyUserInfo,
  });

  return (
    <>
      <h1 className="mb-10 text-3xl font-bold">Settings</h1>

      <div className="space-y-6">
        {user ? (
          <>
            <Label>
              Email
              <Input value={user.email} disabled />
            </Label>
          </>
        ) : (
          <>
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} />
            ))}
          </>
        )}
      </div>
    </>
  );
}
