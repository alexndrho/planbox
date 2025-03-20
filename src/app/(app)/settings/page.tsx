"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ChangePasswordDialogContent from "@/components/ChangePasswordDialogContent";
import queryClient from "@/lib/queryClient";
import { userProfileUpdateInput } from "@/lib/validations/user";
import { getMyUserInfo, updateMyPublicProfile } from "@/services/user";
import { UserWithoutPassword } from "@/types/user";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);
  const { update: updateUserSession } = useSession();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getMyUserInfo,
  });

  const form = useForm<z.infer<typeof userProfileUpdateInput>>({
    resolver: zodResolver(userProfileUpdateInput),
    defaultValues: {
      name: "",
    },
  });

  const resetUserForm = useCallback(
    (user: UserWithoutPassword) => {
      form.reset({
        name: user.name || "",
      });
    },
    [form]
  );

  useEffect(() => {
    if (user) {
      resetUserForm(user);
    }
  }, [user, resetUserForm]);

  const publicProfileMutation = useMutation({
    mutationFn: updateMyPublicProfile,
    onSuccess: (data) => {
      updateUserSession({
        name: data.name,
        email: data.email,
      });

      queryClient.setQueryData(["user"], (oldData) =>
        oldData
          ? {
              ...oldData,
              ...data,
            }
          : oldData
      );

      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      form.setError("root", {
        message: error.message,
      });
    },
  });

  return (
    <>
      <h1 className="mb-10 text-3xl font-bold">Settings</h1>

      <h2 className="mb-4 text-xl font-bold">Public profile</h2>

      {user ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              publicProfileMutation.mutate(values)
            )}
            className="flex flex-col gap-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              {form.formState.isDirty && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => resetUserForm(user)}
                >
                  Cancel
                </Button>
              )}

              <Button
                type="submit"
                disabled={
                  !form.formState.isDirty || publicProfileMutation.isPending
                }
              >
                {publicProfileMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-6">
          {Array.from({ length: 1 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="w-36 h-6" />
              <Skeleton className="w-full h-9" />
            </div>
          ))}

          <div className="flex justify-end">
            <Skeleton className="w-16 h-9" />
          </div>
        </div>
      )}

      <h2 className="mb-4 mt-10 text-xl font-bold">Account</h2>

      {user ? (
        <>
          <Label>
            Email
            <Input type="email" value={user.email} disabled className="mt-2" />
          </Label>

          <div className="mt-4">
            <Dialog
              open={isChangePasswordDialogOpen}
              onOpenChange={setIsChangePasswordDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="destructive">Change password</Button>
              </DialogTrigger>

              <ChangePasswordDialogContent
                onClose={() => setIsChangePasswordDialogOpen(false)}
              />
            </Dialog>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-6">
            {Array.from({ length: 1 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="w-36 h-6" />
                <Skeleton className="w-full h-9" />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Skeleton className="w-36 h-9" />
          </div>
        </>
      )}
    </>
  );
}
