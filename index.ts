import { db, initializeDatabase } from "./src/db.ts";

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/todos" && req.method === "GET") {
      const todos = db.query("SELECT * FROM todos").all();
      return new Response(JSON.stringify(todos), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on ${server.url}`);
