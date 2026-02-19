import { initializeDatabase } from "./src/db.ts";
import {
  createTodo,
  deleteAllTodos,
  deleteTodo,
  getTodos,
  updateTodo,
} from "./src/services/todo-services.ts";

initializeDatabase();
const server = Bun.serve({
  port: 4000,
  routes: {
    "/todos": {
      GET: getTodos,
      POST: createTodo,
      DELETE: deleteAllTodos,
    },
    "/todos/:id": {
      PATCH: updateTodo,
      DELETE: deleteTodo,
    },
  },
});

console.log(`Listening on ${server.url}`);
