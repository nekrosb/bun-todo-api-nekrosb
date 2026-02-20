import { initializeDatabase } from "./src/db.ts";
import {
  createTodo,
  deleteAllTodos,
  deleteTodo,
  getTodos,
  updateTodo,
} from "./src/services/todo-services.ts";

initializeDatabase();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Prefer",
};

const server = Bun.serve({
  port: 4000,

  async fetch(req, server) {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const response = await server.fetch(req);

    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  },

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
