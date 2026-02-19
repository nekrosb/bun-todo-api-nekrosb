import { initializeDatabase } from "./src/db.ts";
import {
  createTodo,
  getTodos,
  updateTodo,
} from "./src/services/todo-services.ts";

initializeDatabase();
const server = Bun.serve({
  port: 3000,
  routes: {
    "/todos": {
      GET: getTodos,
      POST: createTodo,
    },
    "/todos/:id": {
      PATCH: updateTodo,
    },
  },
});

console.log(`Listening on ${server.url}`);
