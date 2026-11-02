const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
});

pool.connect()
    .then((client) => {
        console.log("PostgreSQL Connected Successfully!");
        client.release();
    })
    .catch((err) => {
        console.error("Database Connection Failed:", err.message);
    });

module.exports = pool;