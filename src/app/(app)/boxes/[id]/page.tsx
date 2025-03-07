"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TodoTab from "./TodoTab";
import NotesTab from "./NotesTab";
import { getBox } from "@/services/box";

export default function Box() {
  const params = useParams<{ id: string }>();

  const { data } = useQuery({
    queryKey: ["boxes", params.id],
    queryFn: () => getBox(params.id),
  });

  return (
    <>
      {data ? (
        <h1 className="mb-10 text-3xl font-bold">{data?.name}</h1>
      ) : (
        <Skeleton className="mb-10 h-9 w-full max-w-96" />
      )}

      <Tabs defaultValue="todo">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="todo">Todo</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TodoTab boxId={params.id} />
        <NotesTab />
      </Tabs>
    </>
  );
}
