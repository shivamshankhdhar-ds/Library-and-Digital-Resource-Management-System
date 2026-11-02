
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const router = express.Router();

// ================= PASSWORD VALIDATION =================

const validatePassword = (password) => {

    return (
        typeof password === "string" &&
        password.length === 8 &&
        /[A-Za-z]/.test(password) &&
        /[0-9]/.test(password)
    );

};

// ================= TEST AUTH ROUTE =================

router.get("/test", (req, res) => {

    res.json({
        success: true,
        message: "Auth routes are working!"
    });

});

// ================= STUDENT REGISTRATION =================

router.post("/register", async (req, res) => {

    try {

        const {
            fullName,
            enrollmentId,
            email,
            password
        } = req.body;

        // Check required fields.
        if (
            !fullName ||
            !enrollmentId ||
            !email ||
            password === undefined
        ) {

            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });

        }

        // Validate Full Name.
        if (
            typeof fullName !== "string" ||
            !fullName.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: "Full Name is required."
            });

        }

        // Validate Enrollment ID.
        if (
            typeof enrollmentId !== "string" ||
            !/^[0-9]{10}$/.test(enrollmentId)
        ) {

            return res.status(400).json({
                success: false,
                message: "Enrollment ID must contain exactly 10 digits."
            });

        }

        // Validate Email.
        if (typeof email !== "string") {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });

        }

        const normalizedEmail = email.trim().toLowerCase();

        // Only Gmail and GLA email addresses are allowed.
        if (
            !/^[a-zA-Z0-9._%+-]+@(gmail\.com|gla\.ac\.in)$/i.test(normalizedEmail)
        ) {

            return res.status(400).json({
                success: false,
                message: "Only Gmail and GLA email addresses are allowed."
            });

        }

        // Validate Password.
        if (!validatePassword(password)) {

            return res.status(400).json({
                success: false,
                message: "Password must be exactly 8 characters with at least one letter and one number."
            });

        }

        // Check duplicate Enrollment ID or Email.
        const existing = await pool.query(
            `SELECT id
             FROM students
             WHERE enrollment_id = $1 OR email = $2`,
            [enrollmentId, normalizedEmail]
        );

        if (existing.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Enrollment ID or email is already registered."
            });

        }

        // Hash password using bcrypt.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save student in PostgreSQL.
        await pool.query(
            `INSERT INTO students
            (full_name, enrollment_id, email, password)
            VALUES ($1, $2, $3, $4)`,
            [
                fullName.trim(),
                enrollmentId,
                normalizedEmail,
                hashedPassword
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Account created successfully."
        });

    } catch (error) {

        console.error("Registration Error:", error);

        return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again."
        });

    }

});

// ================= STUDENT LOGIN =================

router.post("/student-login", async (req, res) => {

    try {

        const {
            enrollmentId,
            password
        } = req.body;

        // Check required fields.
        if (!enrollmentId || !password) {

            return res.status(400).json({
                success: false,
                message: "Enrollment ID and password are required."
            });

        }

        // Validate Enrollment ID.
        if (
            typeof enrollmentId !== "string" ||
            !/^[0-9]{10}$/.test(enrollmentId)
        ) {

            return res.status(400).json({
                success: false,
                message: "Enrollment ID must contain exactly 10 digits."
            });

        }

        // Validate Password.
        if (!validatePassword(password)) {

            return res.status(400).json({
                success: false,
                message: "Password must be exactly 8 characters with at least one letter and one number."
            });

        }

        // Find student in PostgreSQL.
        const result = await pool.query(
            `SELECT id, full_name, enrollment_id, email, password
             FROM students
             WHERE enrollment_id = $1`,
            [enrollmentId]
        );

        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid Enrollment ID or Password."
            });

        }

        const student = result.rows[0];

        // Compare entered password with bcrypt hash.
        const passwordMatch = await bcrypt.compare(
            password,
            student.password
        );

        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid Enrollment ID or Password."
            });

        }

        return res.json({

            success: true,

            message: "Student login successful!",

            user: {
                id: student.id,
                fullName: student.full_name,
                enrollmentId: student.enrollment_id,
                email: student.email,
                role: "student"
            }

        });

    } catch (error) {

        console.error("Student Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error. Please try again."
        });

    }

});

// ================= ADMIN LOGIN =================

router.post("/admin-login", async (req, res) => {

    try {

        const {
            adminId,
            password
        } = req.body;

        // Check required fields.
        if (!adminId || !password) {

            return res.status(400).json({
                success: false,
                message: "Admin ID and password are required."
            });

        }

        // Get admin credentials from .env.
        const validAdminId = process.env.ADMIN_ID;
        const validAdminPassword = process.env.ADMIN_PASSWORD;

        if (!validAdminId || !validAdminPassword) {

            return res.status(500).json({
                success: false,
                message: "Admin login is not configured."
            });

        }

        // Verify Admin Credentials.
        if (
            adminId.trim() !== validAdminId ||
            password !== validAdminPassword
        ) {

            return res.status(401).json({
                success: false,
                message: "Invalid Admin ID or Password."
            });

        }

        return res.json({

            success: true,

            message: "Admin login successful!",

            user: {
                adminId: validAdminId,
                role: "admin"
            }

        });

    } catch (error) {

        console.error("Admin Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error. Please try again."
        });

    }

});

// ================= EXPORT ROUTER =================

module.exports = router;
