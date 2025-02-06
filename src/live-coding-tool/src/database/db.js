const { Pool } = require('pg');

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "CSC 299",
    password: "CSC299",
    port: 5432
})

module.exports = pool;

