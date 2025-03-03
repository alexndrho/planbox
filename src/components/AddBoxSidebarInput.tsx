"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";

import queryClient from "@/lib/queryClient";
import { addBox } from "@/services/box";
import { SidebarInput } from "./ui/sidebar";
import { boxInput } from "@/lib/validations/box";

export interface AddBoxSidebarInputProps {
  onClose: () => void;
}

const AddBoxSidebarInput = React.forwardRef<
  React.ElementRef<typeof SidebarInput>,
  React.ComponentPropsWithoutRef<typeof SidebarInput> & AddBoxSidebarInputProps
>(({ onClose, ...props }, ref) => {
  const [name, setName] = useState("");

  const addBoxmutation = useMutation({
    mutationFn: async (name: string) => {
      const { name: parsedName } = boxInput.parse({ name });

      return await addBox(parsedName);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["boxes"] });

      toast.success(data.message);

      onClose();
      setName("");
    },

    onError: (error) => {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message);
      }
    },
  });

  return (
    <SidebarInput
      ref={ref}
      placeholder="Box name"
      disabled={addBoxmutation.isPending}
      onChange={(e) => setName(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          addBoxmutation.mutate(name);
        }
      }}
      {...props}
    />
  );
});

AddBoxSidebarInput.displayName = "AddBoxSidebarInput";

export default AddBoxSidebarInput;
