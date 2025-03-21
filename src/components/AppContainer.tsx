"use client";

import { useEffect, useRef, useState } from "react";
import { DefaultSession } from "next-auth";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  ChevronsUpDown,
  Home,
  LogOut,
  MoreHorizontal,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar";
import { AlertDialog, AlertDialogTrigger } from "./ui/alert-dialog";
import { getBoxes } from "@/services/box";
import DeleteBoxAlertDialogContent from "./DeleteBoxAlertDialogContent";
import AddBoxSidebarInput from "./AddBoxSidebarInput";

interface AppContainerProps {
  children?: React.ReactNode;
  user?: DefaultSession["user"];
}

export default function AppContainer({ children, user }: AppContainerProps) {
  const pathname = usePathname();
  const boxNameInputRef = useRef<HTMLInputElement>(null);
  const [isAddBoxOpen, setIsAddBoxOpen] = useState(false);

  const mainMenuLinks = [
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
  ];

  const menuLinks = [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  const { data: boxesData, isFetching: boxesIsFetching } = useQuery({
    queryKey: ["boxes"],
    queryFn: getBoxes,
  });

  useEffect(() => {
    if (isAddBoxOpen && boxNameInputRef.current) {
      boxNameInputRef.current.focus();
    }
  }, [isAddBoxOpen]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    {user?.email}
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="right"
                  align="start"
                  className="w-[--radix-popper-anchor-width]"
                >
                  {menuLinks.map((link, index) => (
                    <DropdownMenuItem key={index} asChild>
                      <Link href={link.url}>
                        <link.icon />
                        <span>{link.title}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainMenuLinks.map((link) => (
                  <SidebarMenuItem key={link.title}>
                    <SidebarMenuButton asChild isActive={pathname === link.url}>
                      <Link href={link.url}>
                        <link.icon />

                        <span>{link.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Boxes</SidebarGroupLabel>

            <SidebarGroupAction onClick={() => setIsAddBoxOpen(!isAddBoxOpen)}>
              {isAddBoxOpen ? (
                <>
                  <X />
                  <span className="sr-only">Close add box form</span>
                </>
              ) : (
                <>
                  <Plus />
                  <span className="sr-only">Open add box form</span>
                </>
              )}
            </SidebarGroupAction>

            <SidebarGroupContent>
              <SidebarMenu>
                {isAddBoxOpen && (
                  <AddBoxSidebarInput
                    ref={boxNameInputRef}
                    onClose={() => setIsAddBoxOpen(false)}
                  />
                )}

                {boxesData?.map((box) => (
                  <SidebarMenuItem key={box.id}>
                    <SidebarMenuButton
                      isActive={pathname === `/boxes/${box.id}`}
                      asChild
                    >
                      <Link href={`/boxes/${box.id}`}>
                        <span>{box.name}</span>
                      </Link>
                    </SidebarMenuButton>

                    <DropdownMenu>
                      <AlertDialog>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction showOnHover>
                            <MoreHorizontal />
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent side="right" align="start">
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem>
                              <Trash2 className="text-muted-foreground" />
                              <span>Delete box</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>

                        <DeleteBoxAlertDialogContent box={box} />
                      </AlertDialog>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}

                {boxesIsFetching &&
                  boxesData === undefined &&
                  Array.from({ length: 8 }).map((_, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuSkeleton />
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <div className="w-full min-h-screen flex flex-col">
        <header className="px-6 py-2 flex items-center gap-4">
          <SidebarTrigger />
        </header>

        <main className="flex-1 mx-auto px-6 py-8 w-full max-w-4xl flex flex-col">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
