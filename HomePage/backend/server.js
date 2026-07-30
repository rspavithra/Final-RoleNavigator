const express = require("express");
const { spawn } = require("child_process");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Always load .env from the backend directory, even if the process cwd is different.
const envPath = path.join(__dirname, ".env");
const dotenvResult = require("dotenv").config({ path: envPath, override: true });
console.log("Loaded .env from:", envPath);
console.log("dotenv config:", dotenvResult.error ? "FAILED" : "OK");
console.log("MONGO_URI Loaded:", process.env.MONGO_URI ? "YES ✅" : "NO ❌");
if (process.env.MONGO_URI) {
  const safeUri = process.env.MONGO_URI.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+@/, '$1****@');
  console.log("MONGO_URI value:", safeUri);
}

const app = express();
const PORT = process.env.PORT || 5000;

// index.html / style.css / script.js are one level up from backend/
const CLIENT_ROOT = path.join(__dirname, "..");

/* ==============================
   MIDDLEWARE
============================== */
app.use(express.json());
app.use(cors());

/* ==============================
   CONNECT TO MONGODB
============================== */
let dbConnected = false;
let fallbackUsers = [];

// Debug check
console.log("MONGO_URI Loaded:", process.env.MONGO_URI ? "YES ✅" : "NO ❌");

if (process.env.MONGO_URI) {
  const normalizedUri = process.env.MONGO_URI.replace(/\/RoleNavigator(\?|$)/i, "/rolenavigator$1");
  console.log("Normalized Mongo URI:", normalizedUri.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+@/, '$1****@'));

  mongoose.connect(normalizedUri, { dbName: "rolenavigator" })
    .then(() => {
      dbConnected = true;
      console.log("✅ MongoDB Connected Successfully");
      console.log("Connected database name:", mongoose.connection.name);
      if (mongoose.connection.db) {
        console.log("Connected db databaseName:", mongoose.connection.db.databaseName);
      }
    })
    .catch((err) => {
      dbConnected = false;
      console.error("❌ MongoDB Connection Error:", err.name, err.message);
      console.error("⚠️ Verify MONGO_URI username/password, Atlas user access, and IP/network whitelist.");
      console.log("⚠️ Running in fallback (in-memory) mode");
    });
} else {
  console.log("❌ No MONGO_URI found in .env file");
}

/* ==============================
   USER SCHEMA
============================== */
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

/* ==============================
   SERVE STATIC FRONTEND FILES
============================== */
app.use(express.static(CLIENT_ROOT));

/* ==============================
   API ROUTES
============================== */

// ── SIGNUP ──────────────────────────────────────────────
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  console.log("/signup →", { name, email, dbConnected });

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required."
    });
  }

  try {

    // MongoDB Mode
    if (dbConnected) {

      const existing = await User.findOne({ email });

      if (existing) {
        return res.status(409).json({
          message: "An account with this email already exists."
        });
      }

      const newUser = new User({
        name,
        email,
        password
      });

      await newUser.save();

      console.log("✅ Signup saved to MongoDB", { email });

      return res.status(201).json({
        message: "Account created successfully!",
        name
      });
    }

    // Fallback Memory Mode
    const alreadyExists = fallbackUsers.find(
      u => u.email === email
    );

    if (alreadyExists) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    fallbackUsers.push({
      name,
      email,
      password
    });

    console.log("⚠️ Signup stored in memory", { email });

    return res.status(201).json({
      message: "Account created (offline mode).",
      name
    });

  } catch (err) {

    console.error("Signup error:", err.name, err.message);
    console.error(err.stack);

    return res.status(500).json({
      message: "Server error. Please try again.",
      error: err.message
    });
  }
});

// ── LOGIN ────────────────────────────────────────────────
app.post("/login", async (req, res) => {

  const { email, password } = req.body;

  console.log("/login →", { email, dbConnected });

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required."
    });
  }

  try {

    // MongoDB Mode
    if (dbConnected) {

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          message: "No account found with this email."
        });
      }

      if (user.password !== password) {
        return res.status(401).json({
          message: "Incorrect password."
        });
      }

      console.log("✅ Login successful", { email });

      return res.status(200).json({
        message: "Login successful!",
        name: user.name
      });
    }

    // Fallback Memory Mode
    const user = fallbackUsers.find(
      u => u.email === email
    );

    if (!user) {
      return res.status(401).json({
        message: "No account found with this email."
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Incorrect password."
      });
    }

    return res.status(200).json({
      message: "Login successful! (offline mode)",
      name: user.name
    });

  } catch (err) {

    console.error("Login error:", err);

    return res.status(500).json({
      message: "Server error. Please try again.",
      error: err.message
    });
  }
});

app.get("/debug-status", (req, res) => {
  return res.json({
    pid: process.pid,
    envLoaded: !!process.env.MONGO_URI,
    dbConnected,
    dbName: mongoose.connection.name,
    dbDatabaseName: mongoose.connection.db ? mongoose.connection.db.databaseName : null,
  });
});

// ── TEST ROUTE ───────────────────────────────────────────
app.get("/force", async (req, res) => {

  try {

    const payload = {
      name: "Test User",
      email: "test@test.com",
      password: "123456"
    };

    if (dbConnected) {

      const u = new User(payload);

      await u.save();

      return res.send("✅ Test user saved to MongoDB");
    }

    fallbackUsers.push(payload);

    return res.send("⚠️ Test user saved to memory");

  } catch (err) {

    return res.status(500).send(
      "Error: " + err.message
    );
  }
});

// ── CATCH ALL ────────────────────────────────────────────
app.use((req, res) => {
  res.sendFile(
    path.join(CLIENT_ROOT, "index.html")
  );
});

/* ==============================
   START SERVER
============================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});