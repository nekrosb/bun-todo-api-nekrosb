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
  const id = Number(req.url.split("/").pop());

  try {
    const body = await req.json();
    const validated = parse(reqUpdateValidator, body);

    const entries = Object.entries(validated).filter(
      ([_, value]) => value !== undefined,
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
      { status: 500 },
    );
  }
};
