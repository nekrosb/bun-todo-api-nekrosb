import { initializeDatabase } from "./src/db.ts";
import { getTodos, createTodo } from "./src/services/todo-services.ts";

initializeDatabase();
const server = Bun.serve({
  port: 3000,
  routes: {
    "/todos": {
      GET: getTodos,
      POST: createTodo,
    },
  },
});

console.log(`Listening on ${server.url}`);
