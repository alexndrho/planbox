"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TabsContent } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddTodoDialogContent from "@/components/AddTodoDialogContent";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import TodoItem from "@/components/TodoItem";
import { getTodos } from "@/services/todo";
import { Skeleton } from "@/components/ui/skeleton";

const statusList = [
  {
    value: "active",
    label: "Active",
  },
  {
    value: "missed",
    label: "Missed",
  },
  {
    value: "completed",
    label: "Completed",
  },
];

type statusType = "active" | "missed" | "completed";

export interface TodoTabProps {
  boxId: string;
}

export default function TodoTab({ boxId }: TodoTabProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState<statusType>("active");
  const [isTodoDialogOpen, setIsTodoDialogOpen] = useState(false);

  const { data, isFetching } = useQuery({
    queryKey: ["boxes", boxId, "todos"],
    queryFn: () => getTodos(boxId),
  });

  const filteredTodos = data?.filter((todo) => {
    if (statusValue === "active") {
      return (
        !todo.done && (!todo.deadline || new Date(todo.deadline) >= new Date())
      );
    } else if (statusValue === "missed") {
      return (
        todo.deadline && new Date(todo.deadline) < new Date() && !todo.done
      );
    } else if (statusValue === "completed") {
      return todo.done;
    }
    return true;
  });

  return (
    <TabsContent value="todo">
      <div className="flex justify-between gap-4">
        <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
          <PopoverTrigger asChild>
            <Button
              role="combobox"
              variant="outline"
              aria-expanded={isStatusOpen}
              className="w-36 capitalize"
            >
              {statusValue}
              <ChevronsUpDown className="ml-auto opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent side="bottom" align="start" className="w-40 p-0">
            <Command>
              <CommandList>
                <CommandGroup>
                  {statusList.map((status) => (
                    <CommandItem
                      key={status.value}
                      onSelect={() => {
                        setStatusValue(status.value as statusType);
                        setIsStatusOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          statusValue === status.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />

                      {status.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Dialog open={isTodoDialogOpen} onOpenChange={setIsTodoDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              Add
            </Button>
          </DialogTrigger>

          <AddTodoDialogContent
            boxId={boxId}
            onClose={() => setIsTodoDialogOpen(false)}
          />
        </Dialog>
      </div>

      <div className="py-6 space-y-4">
        {filteredTodos?.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}

        {isFetching && !filteredTodos && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        )}
      </div>
    </TabsContent>
  );
}
