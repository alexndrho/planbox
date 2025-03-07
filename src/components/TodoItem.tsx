import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { Todo } from "@prisma/client";
import { z } from "zod";
import { format } from "date-fns";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2 } from "lucide-react";

import queryClient from "@/lib/queryClient";
import { deleteTodo, updateTodo } from "@/services/todo";
import { todoUpdateInput } from "@/lib/validations/todo";
import { CheckedState } from "@radix-ui/react-checkbox";

interface TodoItemProps {
  todo: Todo;
}

export default function TodoItem({ todo }: TodoItemProps) {
  const [isDone, setIsDone] = useState<CheckedState>(todo.done);

  const updateMutation = useMutation({
    mutationFn: (t: z.infer<typeof todoUpdateInput>) =>
      updateTodo(todo.id, todo.boxId, t),
    onSuccess: () => {
      queryClient.setQueryData(
        ["boxes", todo.boxId, "todos"],
        // Update the todo status
        (oldData: Todo[] | undefined) =>
          oldData
            ? oldData.map((t) =>
                t.id === todo.id ? { ...t, done: isDone } : t
              )
            : oldData
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTodo(todo.id, todo.boxId),
    onSuccess: () => {
      queryClient.setQueryData(
        ["boxes", todo.boxId, "todos"],
        // Remove the todo from the list
        (oldData: Todo[] | undefined) =>
          oldData ? oldData.filter((t) => t.id !== todo.id) : oldData
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCheckboxChange = useDebouncedCallback((checked: boolean) => {
    updateMutation.mutate({ done: checked });
  }, 250);

  useEffect(() => {
    if (isDone === todo.done) return;
    handleCheckboxChange(isDone === true);
  }, [todo.done, isDone, handleCheckboxChange]);

  return (
    <div
      key={todo.id}
      className="border border-primary rounded-md px-4 py-2 flex items-center justify-between gap-2"
    >
      <div className="flex-1 flex items-center gap-4">
        <Checkbox
          id={`todo-${todo.id}`}
          size="xl"
          checked={isDone}
          onCheckedChange={setIsDone}
        />

        <label
          htmlFor={`todo-${todo.id}`}
          className="flex-1 flex flex-col text-lg select-none"
        >
          <span className="truncate">{todo.todo}</span>

          {todo.deadline && (
            <span className="text-sm truncate">
              {format(todo.deadline, "PPP hh:mm aa")}
            </span>
          )}
        </label>
      </div>

      <Button
        variant="destructive"
        size="icon"
        onClick={() => deleteMutation.mutate()}
      >
        {deleteMutation.isPending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Trash2 />
        )}
      </Button>
    </div>
  );
}
