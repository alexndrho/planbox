"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { boxInput } from "@/lib/validations/box";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { addBox } from "@/services/box";
import queryClient from "@/lib/queryClient";
import { toast } from "sonner";
import { DialogDescription } from "@radix-ui/react-dialog";

export interface AddBoxDialogContentProps {
  onClose: () => void;
}

export default function AddBoxDialogContent({
  onClose,
}: AddBoxDialogContentProps) {
  const form = useForm<z.infer<typeof boxInput>>({
    resolver: zodResolver(boxInput),
    defaultValues: {
      name: "",
    },
  });

  const mutation = useMutation({
    mutationFn: addBox,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["boxes"] });

      toast.success(data.message);

      onClose();
      form.reset();
    },
    onError: (error) => {
      form.setError("root", {
        message: error.message,
      });
    },
  });
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New Box</DialogTitle>
        <DialogDescription>Add a new box to your collection</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data.name))}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Box name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end items-center">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              Add Box
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
