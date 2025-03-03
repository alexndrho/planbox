"use client";
import { SessionProvider, SessionProviderProps } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/lib/queryClient";

interface ProviderProps extends SessionProviderProps {
  children: React.ReactNode;
}

export default function Provider({ children, ...props }: ProviderProps) {
  return (
    <SessionProvider {...props}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
