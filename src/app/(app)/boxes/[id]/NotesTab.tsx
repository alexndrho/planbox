"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type Content } from "@tiptap/react";
import { toast } from "sonner";

import { TabsContent } from "@/components/ui/tabs";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getNote, upsertNote } from "@/services/note";

export interface TodoTabProps {
  boxId: string;
}

export default function NotesTab({ boxId }: TodoTabProps) {
  const [isEdit, setIsEdit] = useState(true);
  const [renderCount, setRenderCount] = useState(0);

  const query = useQuery({
    queryKey: ["boxes", boxId, "note"],
    queryFn: () => getNote(boxId),
  });

  const mutation = useMutation({
    mutationFn: (content: Content) => upsertNote(boxId, content),
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onChange = (content: Content) => {
    console.log(content);
    console.log("render count", renderCount);
    setRenderCount((prev) => prev + 1);
  };

  return (
    <TabsContent value="notes" className="flex-1 flex flex-col">
      {!query.isLoading && query.data ? (
        <>
          <div className="mb-2 flex justify-end gap-4">
            {mutation.isPending ? (
              <Badge variant="secondary">Saving...</Badge>
            ) : mutation.isError ? (
              <Badge variant="destructive">Failed to save</Badge>
            ) : (
              mutation.isSuccess && <Badge variant="secondary">Saved</Badge>
            )}

            <Label className="flex items-center gap-2">
              Edit
              <Switch checked={isEdit} onCheckedChange={setIsEdit} />
            </Label>
          </div>

          <MinimalTiptapEditor
            // value is on initial state only
            value={"hiii"}
            debounceDelay={1000}
            // Called when content updates, empty string on initial run
            onChange={onChange}
            editable={isEdit}
            output="html"
            className={cn("flex-1 w-full rounded-xl")}
            editorContentClassName="overflow-auto h-full"
            placeholder="Write your notes here..."
            editorClassName="focus:outline-none px-5 py-4 h-full"
          />
        </>
      ) : (
        <Skeleton className="flex-1" />
      )}
    </TabsContent>
  );
}
