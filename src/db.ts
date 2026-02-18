import { Database } from "bun:sqlite";

export const db = new Database("./data/mydb.sqlite", { create: true });

db.run(`
    create table if not exists todos (
    id integer primary key autoincrement,
    title text not null,
    content text,
    due_date text,
    done boolean not null
    );
    `);
