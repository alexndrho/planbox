import { z } from "zod";
import { todoUpdateInput } from "@/lib/validations/todo";
import type { Todo } from "@prisma/client";

export async function addTodo(boxId: string, todo: string, deadline?: Date) {
  const response = await fetch(`/api/boxes/${boxId}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ todo, deadline }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors[0].message);
  }

  return data;
}

export async function getTodos(boxId: string) {
  const response = await fetch(`/api/boxes/${boxId}/todos`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors[0].message);
  }

  return data as Todo[];
}

export async function updateTodo(
  todoId: string,
  boxId: string,
  todo: z.infer<typeof todoUpdateInput>
) {
  const response = await fetch(`/api/boxes/${boxId}/todos/${todoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors[0].message);
  }

  return data;
}

export async function deleteTodo(todoId: string, boxId: string) {
  const response = await fetch(`/api/boxes/${boxId}/todos/${todoId}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors[0].message);
  }

  return data;
}
