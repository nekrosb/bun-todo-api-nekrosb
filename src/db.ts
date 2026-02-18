import { Database } from "bun:sqlite";

export const db = new Database(`${import.meta.dir}/data/mydb.sqlite`, {
    create: true,
});

export function initializeDatabase() {
    db.run(`
    create table if not exists todos (
    id integer primary key autoincrement,
    title text not null,
    content text,
    due_date text,
    -- date is yyyy-mm-dd
    done boolean not null
    );
    `);
    const num =
        db.prepare<{ count: number }>("SELECT COUNT(*) as count FROM todos")
            .get().count;
    console.log(`we have ${num}`);

    if (num === 0) {
        db.run(`
    insert into todos (title, content, due_date, done) values
    ('Buy groceries', 'Milk, Bread, Eggs', '2024-07-01', false),
    ('Finish project', 'Complete the API implementation', '2024-07-05', false),
    ('Call mom', 'Check in with family', '2024-07-02', false);
    `);
    }
}
