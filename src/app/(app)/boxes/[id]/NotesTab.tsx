"use client";

import { useState } from "react";
import type { Note } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Content } from "@tiptap/react";
import { toast } from "sonner";

import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { cn } from "@/lib/utils";
import { getNote, upsertNote } from "@/services/note";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import queryClient from "@/lib/queryClient";

export interface NotesTabProps {
  boxId: string;
}

export default function NotesTab({ boxId }: NotesTabProps) {
  const [isEdit, setIsEdit] = useState(false);

  const queryNote = useQuery({
    queryKey: ["boxes", boxId, "note"],
    queryFn: () => getNote(boxId),
  });

  const mutation = useMutation({
    mutationFn: (content: Content) => upsertNote(boxId, content),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["boxes", boxId, "note"],
        (oldData: Note | undefined) =>
          oldData
            ? {
                ...oldData,
                content: data.content,
              }
            : oldData
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <TabsContent value="notes" className="flex flex-col">
      <div className="mb-4 flex justify-end gap-4">
        {mutation.isPending ? (
          <Badge variant="secondary">Saving...</Badge>
        ) : mutation.isError ? (
          <Badge variant="destructive">Failed to save</Badge>
        ) : (
          mutation.isSuccess && <Badge variant="secondary">Saved</Badge>
        )}

        <Label className="flex items-center gap-2">
          edit?
          <Switch checked={isEdit} onCheckedChange={setIsEdit} />
        </Label>
      </div>

      {!queryNote.isLoading ? (
        <MinimalTiptapEditor
          // value is only used for initial value
          value={queryNote.data?.content}
          onChange={mutation.mutate}
          editable={isEdit}
          debounceDelay={1000}
          immediatelyRender={false}
          output="html"
          className={cn(
            "flex-1 w-full rounded-xl",
            !isEdit && "border-none rounded-none shadow-none"
          )}
          editorClassName={cn(
            "focus:outline-none h-full",
            isEdit && "px-5 py-4"
          )}
          editorContentClassName="overflow-auto h-full"
          placeholder="Write your notes here..."
        />
      ) : (
        <Skeleton className="flex-1 w-full" />
      )}
    </TabsContent>
  );
}
