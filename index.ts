import { db, initializeDatabase } from "./src/db.ts";

initializeDatabase();
const server = Bun.serve({
  port: 3000,
  routes: {
    "/todos": {
      GET: async () => {
        const todos = db.prepare("SELECT * FROM todos").all();
        return new Response(JSON.stringify(todos), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

console.log(`Listening on ${server.url}`);
