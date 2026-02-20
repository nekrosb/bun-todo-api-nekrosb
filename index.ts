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
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: corsHeaders,
        }),
    },
    "/todos/:id": {
      PATCH: updateTodo,
      DELETE: deleteTodo,
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: corsHeaders,
        }),
    },
  },
});

console.log(`Listening on ${server.url}`);
