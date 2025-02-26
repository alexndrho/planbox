"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { userSignupInput } from "@/lib/validations/user";
import IError from "@/types/IError";
import RedirectIfAuthenticated from "@/components/RedirectIfAuthenticated";

const loginInput = userSignupInput
  .extend({
    confirmPassword: z.string(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export default function Signup() {
  const { push } = useRouter();
  const [isSigningup, setIsSigningup] = useState(false);

  const form = useForm<z.infer<typeof loginInput>>({
    resolver: zodResolver(loginInput),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginInput>) => {
    setIsSigningup(true);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      push("/login");
    } else {
      const error = (await response.json()) as IError;

      error.errors.forEach((e) => {
        if (e.code === "auth/invalid-input") {
          form.setError("root", { message: e.message });
        } else if (e.code === "auth/invalid-email") {
          form.setError("email", { message: e.message });
        } else if (e.code === "auth/invalid-password") {
          form.setError("password", { message: e.message });
        } else {
          form.setError("root", { message: e.message });
        }
      });

      setIsSigningup(false);
    }
  };

  return (
    <RedirectIfAuthenticated>
      <div className="container min-h-dvh mx-auto px-4 flex justify-center items-center">
        <div className="flex-1 max-w-[500px]">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/">
              <ArrowLeft />
              Go back to home
            </Link>
          </Button>

          <main>
            <Card>
              <CardHeader>
                <CardTitle>Sign up</CardTitle>
                <CardDescription>
                  Already have an account?{" "}
                  <Button variant="link" asChild className="!p-0">
                    <Link href="/login">Log in</Link>
                  </Button>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your email address"
                              autoComplete="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
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
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm your password"
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

                    <div className="flex justify-end items-center">
                      <Button type="submit" disabled={isSigningup}>
                        {isSigningup && <Loader2 className="animate-spin" />}
                        Sign up
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </RedirectIfAuthenticated>
  );
}
