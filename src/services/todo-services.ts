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
    const f: string[] = [];
    const d: any[] = [];

    if (validated.title !== undefined && validated.title !== null) {
      f.push("title");
      d.push(validated.title);
    }
    if (validated.content !== undefined && validated.content !== null) {
      f.push("content");
      d.push(validated.content);
    }
    if (
      validated.due_date !== undefined && validated.due_date !== null
    ) {
      f.push("due_date");
      d.push(validated.due_date);
    }
    if (validated.done !== undefined && validated.done !== null) {
      f.push("done");
      d.push(validated.done);
    }

    if (f.length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const query = `UPDATE todos SET ${
      f.map((field) => `${field} = ?`).join(", ")
    } WHERE id = ?`;
    d.push(id);
    db.run(query, d);

    return new Response(
      JSON.stringify({
        message: "Todo updated successfully",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: "Failed to update todo" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};
