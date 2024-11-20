const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "37.27.187.4",
  user: "root",
  password: "l51Qh6kM2vb3npALukrKNMzNAlBogTj0NSH4Gd3IxqMfaP0qfFkp54e7jcknqGNX",
  database: "ai_agent",

  // host: "localhost",
  // user: "root",
  // password: "",
  // database: "ai_agent",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
