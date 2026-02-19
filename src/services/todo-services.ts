import { db } from "../db.ts";
import { boolean, object, optional, parse, string } from "valibot";

export const getTodos = async () => {
  const todos = db.prepare("SELECT * FROM todos").all();
  return new Response(JSON.stringify(todos), {
    headers: { "Content-Type": "application/json" },
  });
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
    return new Response(JSON.stringify(newTodo), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: "Failed to create todo" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
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
    return new Response(
      JSON.stringify({ error: "Missing id" }),
      { status: 400 },
    );
  }

  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return new Response(
      JSON.stringify({ error: "Invalid id" }),
      { status: 400 },
    );
  }

  try {
    const body = await req.json();
    const validated = parse(reqUpdateValidator, body);

    const allowedFields = ["title", "description", "completed", "priority"];

    const entries = Object.entries(validated)
      .filter(([key, value]) =>
        value !== undefined && allowedFields.includes(key)
      );

    if (entries.length === 0) {
      return new Response(
        JSON.stringify({ error: "No fields to update" }),
        { status: 400 },
      );
    }

    const fields = entries.map(([key]) => `${key} = ?`).join(", ");
    const values = entries.map(([_, value]) => value);

    db.run(
      `UPDATE todos SET ${fields} WHERE id = ?`,
      [...values, id],
    );

    return new Response(
      JSON.stringify({ message: "Todo updated successfully" }),
      { status: 200 },
    );
  } catch (err) {
    console.log(err);
    return new Response(
      JSON.stringify({ error: "Failed to update todo" }),
      { status: 400 },
    );
  }
};
