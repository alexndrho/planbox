import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { userPasswordUpdateWithConfirmInput } from "@/lib/validations/user";
import { updateMyPassword } from "@/services/user";

export interface ChangePasswordDialogContentProps {
  onClose: () => void;
}

export default function ChangePasswordDialogContent({
  onClose,
}: ChangePasswordDialogContentProps) {
  const form = useForm<z.infer<typeof userPasswordUpdateWithConfirmInput>>({
    resolver: zodResolver(userPasswordUpdateWithConfirmInput),
    defaultValues: {
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: updateMyPassword,
    onSuccess: () => {
      onClose();
      form.reset();

      toast.success("Password updated successfully");
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
        <DialogTitle>Change Password</DialogTitle>
        <DialogDescription>
          Please enter your current password and new password
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Current Password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="New Password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm New Password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.formState.errors.root && (
            <FormMessage className="!mt-2">
              {form.formState.errors.root.message}
            </FormMessage>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
