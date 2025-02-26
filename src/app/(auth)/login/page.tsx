"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
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
import RedirectIfAuthenticated from "@/components/RedirectIfAuthenticated";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export default function Login() {
  const [isLoggingin, setIsLoggingin] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoggingin(true);

    const signInData = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    console.log(signInData);

    if (signInData?.error) {
      form.setError("root", {
        message: "Credentials are invalid",
      });

      setIsLoggingin(false);
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
                <CardTitle>Log in</CardTitle>
                <CardDescription>
                  Don&apos;t have an account?{" "}
                  <Button variant="link" asChild className="!p-0">
                    <Link href="/signup">Sign up</Link>
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
                              autoComplete="current-password"
                              placeholder="Enter your password"
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
                      <Button type="submit" disabled={isLoggingin}>
                        {isLoggingin && <Loader2 className="animate-spin" />}
                        Log in
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
