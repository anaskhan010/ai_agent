// index.js
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const pool = require("./config/DBConnection");
const helmet = require("helmet");
const cors = require("cors");
const userRoutes = require("./routes/userRoute/userRoute");
const roleRoutes = require("./routes/roleRoute/roleRoutes");
const contactRoutes = require("./routes/contactRoute/contactRoute");
const AssistantRoutes = require("./routes/AssistantRoutes/AssistantRoutes");
const outboundCallRoutes = require("./routes/outboundRoutes/outboundCallRoutes");
dotenv.config({ path: "./config/config.env" });

app.use(express.json());
app.use(helmet());
app.use(cors());
// Routes
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api", contactRoutes);
app.use("/api/assistant", AssistantRoutes);
app.use("/api/outboundcall", outboundCallRoutes);

app.get("/", (req, res) => {
  res.send("User Management API is running.");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

const PORT = process.env.PORT;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    // Test database connection
    const connection = await pool.getConnection();
    console.log("MySQL Database connected successfully");
    connection.release(); // Release the connection back to the pool
  } catch (err) {
    console.error("Database connection error:", err);
  }
});
