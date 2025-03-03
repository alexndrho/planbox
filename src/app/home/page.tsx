"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import AddBoxDialogContent from "@/components/AddBoxDialogContent";
import AppContainer from "@/components/AppContainer";
import { getBoxes } from "@/services/box";
import { getPeriodOfDay } from "@/helpers/date";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [isAddBoxDialogOpen, setIsAddBoxDialogOpen] = useState(false);
  const [periodOfDay, setPeriodOfDay] = useState("");
  const { data: session } = useSession();

  const { data: boxesData, isFetching: boxesIsFetching } = useQuery({
    queryKey: ["boxes"],
    queryFn: getBoxes,
  });

  useEffect(() => {
    setPeriodOfDay(getPeriodOfDay());
  }, []);

  return (
    <AppContainer user={session?.user}>
      {periodOfDay ? (
        <h1 className="mb-10 text-3xl font-bold text-center">
          Good {periodOfDay}
          {session?.user?.name ? `, ${session?.user?.name}` : ""}!
        </h1>
      ) : (
        <div className="mb-10 flex justify-center">
          <Skeleton className="h-9 w-full max-w-96" />
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Dialog open={isAddBoxDialogOpen} onOpenChange={setIsAddBoxDialogOpen}>
          <DialogTrigger asChild>
            <Card
              role="button"
              className="aspect-square p-4 flex items-center justify-center cursor-pointer"
            >
              <Plus size={32} />
              <div className="sr-only">Add a new box</div>
            </Card>
          </DialogTrigger>

          <AddBoxDialogContent onClose={() => setIsAddBoxDialogOpen(false)} />
        </Dialog>

        {!boxesData &&
          boxesIsFetching &&
          Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-xl" />
          ))}

        {boxesData?.map((box) => (
          <Link key={box.id} href={`/box/${box.id}`}>
            <Card className="aspect-square p-4 flex items-center justify-center">
              <p className="text-lg text-center overflow-hidden text-ellipsis">
                {box.name}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </AppContainer>
  );
}
