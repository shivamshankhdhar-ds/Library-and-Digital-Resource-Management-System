
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Check which routes are actually loaded
console.log(
    "LOADED AUTH ROUTES:",
    authRoutes.stack.map(route => route.route?.path).filter(Boolean)
);

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Library Management System API is running!");
});

app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ success: true, time: result.rows[0].now });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
});
