const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const WebSocket = require("ws");

dotenv.config();
const router = express.Router();
const secretKey = process.env.JWT_SECRET || "your_secret_key";

// ตั้งค่า Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ตั้งค่า Multer สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map(); // เก็บ userId กับ WebSocket connection

// 📌 เมื่อมี Client เชื่อมต่อ
wss.on("connection", (ws, req) => {
    const userId = req.url.split("?userId=")[1]; // ดึง userId จาก query string
    if (userId) {
        clients.set(userId, ws);
        console.log(`User ${userId} connected to WebSocket.`);
    }

    ws.on("close", () => {
        clients.delete(userId);
        console.log(`User ${userId} disconnected.`);
    });
});

// 📌 ฟังก์ชันส่งแจ้งเตือน
const sendNotification = async (userId, message) => {
    try {
        // บันทึกแจ้งเตือนลงฐานข้อมูล
        await pool.query("INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?)", 
            [userId, message, false]);

        // ส่งแจ้งเตือนผ่าน WebSocket
        if (clients.has(userId)) {
            clients.get(userId).send(JSON.stringify({ message }));
        }
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

// ✅ Register API (เก็บข้อมูลลง users และ kyc_documents)
router.post("/register", upload.single("idfile"), async (req, res) => {
    const { email, username, password, firstName, lastName, address, id_number } = req.body;
    const idfile = req.file ? req.file.filename : null;

    if (!username || !password || !idfile) {
        return res.status(400).json({ error: "Username, password, and ID file are required" });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // ตรวจสอบ username/email ซ้ำ
        const [userExists] = await connection.query("SELECT * FROM users WHERE username = ?", [username]);
        if (userExists.length > 0) {
            throw new Error("Username already exists");
        }
        const [emailExists] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
        if (emailExists.length > 0) {
            throw new Error("Email already exists");
        }

        // Hash รหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // บันทึก users
        const userId = uuidv4();
        const createdAt = new Date();
        const BangkokTime = createdAt.toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
        await connection.query(
            "INSERT INTO users (id, email, username, password, first_name, last_name, address, id_number, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [userId, email, username, hashedPassword, firstName, lastName, address, id_number, "user", BangkokTime]
        );

        // บันทึก kyc_documents
        await connection.query(
            "INSERT INTO kyc_documents (user_id, file_path, status) VALUES (?, ?, ?)",
            [userId, idfile, "pending",]
        );

        await connection.commit();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: error.message || "Internal server error" });
    } finally {
        connection.release();
    }
});

// ✅ Login API
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const connection = await pool.getConnection();
    try {
        const [users] = await connection.query("SELECT * FROM users WHERE username = ?", [username]);
        if (users.length === 0) {
            return res.status(401).json({ error: "User not found" });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: "Incorrect password" });

        const token = jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: "1h" });
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        connection.release();
    }
});

// ✅ ดึงรายการผู้ใช้ทั้งหมด
router.get("/user-lists", async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const connection = await pool.getConnection();
    try {
        const [users] = await connection.query(
            "SELECT * FROM users WHERE username LIKE ? OR email LIKE ? LIMIT ? OFFSET ?", 
            [`%${search}%`, `%${search}%`, Number(limit), offset]
        );
        const [totalRows] = await connection.query(
            "SELECT COUNT(*) AS total FROM users WHERE username LIKE ? OR email LIKE ?", 
            [`%${search}%`, `%${search}%`]
        );
        
        const total = totalRows[0].total;
        res.status(200).json({ data: users, pagination: { page, limit, total, totalPages: Math.ceil(total / Number(limit)) } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        connection.release();
    }
});

// ✅ ดึงข้อมูลผู้ใช้ตาม ID
router.get("/user-lists/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decodedToken = jwt.verify(token, secretKey);
        if (decodedToken.id !== req.params.id) {
            return res.status(403).json({ error: "You are not authorized to view this user" });
        }

        const connection = await pool.getConnection();
        const [users] = await connection.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
        connection.release();

        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ data: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/kyc-pending", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [requests] = await connection.query("SELECT * FROM kyc_documents WHERE status = 'pending'");
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    } finally {
        connection.release();
    }
});

router.post("/kyc-action/:id", async (req, res) => {
    const { status } = req.body;
    const kycId = req.params.id;

    if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // อัปเดตสถานะ KYC
        await connection.query("UPDATE kyc_documents SET status = ? WHERE id = ?", [status, kycId]);

        // ดึง user_id ของ KYC ที่อัปโหลด
        const [kycData] = await connection.query("SELECT user_id FROM kyc_documents WHERE id = ?", [kycId]);
        const userId = kycData[0]?.user_id;

        // ส่งแจ้งเตือน
        if (userId) {
            const message = `Your KYC has been ${status}.`;
            await sendNotification(userId, message);
        }

        await connection.commit();
        res.json({ message: `KYC ${status}` });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: "Internal server error" });
    } finally {
        connection.release();
    }
});



module.exports = app;