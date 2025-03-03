import type { Box } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import React from "react";

import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import queryClient from "@/lib/queryClient";
import { moveToTrashBox } from "@/services/box";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

export interface DeleteBoxAlertDialogContentProps {
  box: Box;
}

const DeleteBoxAlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogContent>,
  React.ComponentPropsWithoutRef<typeof AlertDialogContent> &
    DeleteBoxAlertDialogContentProps
>(({ box, ...props }, ref) => {
  const deleteBoxMutation = useMutation({
    mutationFn: async (id: string) => {
      return await moveToTrashBox(id);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["boxes"] });

      toast.success(data.message);
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <AlertDialogContent ref={ref} {...props}>
      <AlertDialogHeader>
        <AlertDialogTitle className="break-all">
          {`Are you sure you want to delete ${box.name} box?`}
        </AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the box and
          remove all associated data.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>

        <Button
          disabled={deleteBoxMutation.isPending}
          onClick={() => deleteBoxMutation.mutate(box.id)}
        >
          {deleteBoxMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Deleting...
            </>
          ) : (
            "Confirm"
          )}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
});

DeleteBoxAlertDialogContent.displayName = "DeleteBoxAlertDialogContent";

export default DeleteBoxAlertDialogContent;
