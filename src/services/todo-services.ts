import { db } from "../db.ts";
import { boolean, object, optional, parse, string } from "valibot";

export const createResponse = (data: any, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

export const getTodos = async () => {
  const todos = db.prepare("SELECT * FROM todos").all();
  return createResponse(todos);
};

export const reqValidator = object({
  title: string(),
  content: string(),
  due_date: string(),
  done: boolean(),
});

export const createTodo = async (req: Request) => {
  try {
    const body = await req.json();
    const validated = parse(reqValidator, body);
    const { title, content, due_date, done } = validated;
    const stmt = db.run(
      "INSERT INTO todos (title, content, due_date, done) VALUES (?, ?, ?, ?)",
      [title, content, due_date, done],
    );
    const newTodo = db.prepare("SELECT * FROM todos WHERE id = ?").get(
      stmt.lastInsertRowid,
    );
    return createResponse(newTodo, 201);
  } catch (err) {
    return createResponse({ error: "Failed to create todo" }, 500);
  }
};
const reqUpdateValidator = object({
  title: optional(string()),
  content: optional(string()),
  due_date: optional(string()),
  done: optional(boolean()),
});

export const updateTodo = async (req: Request) => {
  const url = new URL(req.url);
  const idParam = url.pathname.split("/").pop();

  if (!idParam) {
    return createResponse({ error: "Missing id" }, 400);
  }

  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return createResponse({ error: "Invalid id" }, 400);
  }

  try {
    const body = await req.json();
    if (body.done !== undefined) {
      body.done = Boolean(body.done);
    }

    const validated = parse(reqUpdateValidator, body);

    const allowedFields = ["title", "content", "due_date", "done"];

    const entries = Object.entries(validated)
      .filter(([key, value]) =>
        value !== undefined && allowedFields.includes(key)
      );

    if (entries.length === 0) {
      return createResponse({ error: "No fields to update" }, 400);
    }

    const fields = entries.map(([key]) => `${key} = ?`).join(", ");
    const values = entries.map(([_, value]) => value);

    db.run(
      `UPDATE todos SET ${fields} WHERE id = ?`,
      [...values, id],
    );

    return createResponse({ message: "Todo updated successfully" });
  } catch (err) {
    return createResponse({ error: "Failed to update todo" }, 500);
  }
};

export const deleteTodo = async (req: Request) => {
  const url = new URL(req.url);
  const idParam = url.pathname.split("/").pop();

  if (!idParam) {
    return createResponse({ error: "Missing id" }, 400);
  }

  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return createResponse({ error: "Invalid id" }, 400);
  }

  try {
    const todo = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);

    if (!todo) {
      return createResponse({ error: "Todo not found" }, 404);
    }

    db.run(
      `DELETE FROM todos WHERE id = ?`,
      [id],
    );

    return createResponse({ message: "Todo deleted successfully" });
  } catch (err) {
    return createResponse({ error: "Failed to delete todo" }, 500);
  }
};

export const deleteAllTodos = async () => {
  try {
    db.run(`DELETE FROM todos`);
    return createResponse({ message: "All todos deleted successfully" });
  } catch (err) {
    return createResponse({ error: "Failed to delete all todos" }, 500);
  }
};
