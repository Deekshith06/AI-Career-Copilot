const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();
const AI_TIMEOUT_MS = 1500;
const MONGO_CONNECT_TIMEOUT_MS = 8000;
const GEMINI_MODEL = "gemini-2.5-flash";
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
// Allow up to 5 MB JSON bodies so base64-encoded profile images fit
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

app.get("/", (req, res) => {
  res.send("AI Career Copilot Backend Running");
});

const safeEncodeCredential = (value) => {
  try {
    return encodeURIComponent(decodeURIComponent(value));
  } catch {
    return encodeURIComponent(value);
  }
};

const normalizeMongoUri = (rawUri) => {
  if (!rawUri) {
    return "";
  }

  const trimmed = rawUri.trim().replace(/^['"]|['"]$/g, "").replace(/\?{2,}/g, "?");
  const match = trimmed.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);

  if (!match) {
    return trimmed;
  }

  const [, prefix, username, password, rest] = match;
  return `${prefix}${safeEncodeCredential(username)}:${safeEncodeCredential(password)}@${rest}`;
};

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const isValidEmail = (value) => EMAIL_PATTERN.test(normalizeEmail(value));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let isDatabaseReady = false;
let mongoConnectPromise = null;
let mongoLastError = null;
const mongoUri = normalizeMongoUri(process.env.MONGO_URI);

mongoose.connection.on("connected", () => {
  isDatabaseReady = true;
  mongoLastError = null;
  console.log("MongoDB connected");
});

mongoose.connection.on("disconnected", () => {
  isDatabaseReady = false;
  mongoConnectPromise = null;
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  isDatabaseReady = false;
  mongoLastError = err;
  console.error("MongoDB connection error:");
  console.error(err.message);
});

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  profileImage: { type: String, default: "" },
  // --- Persisted progress ---
  tasks: {
    type: Array,
    default: [],
  },
  progress: {
    type: new mongoose.Schema({
      totalXp:       { type: Number, default: 0 },
      totalCompleted:{ type: Number, default: 0 },
      dailyHistory:  { type: Map, of: Number, default: {} },
    }, { _id: false }),
    default: () => ({ totalXp: 0, totalCompleted: 0, dailyHistory: {} }),
  },
});

const User = mongoose.model("User", userSchema);

const toPublicUser = (user) => ({
  id: user._id,
  email: user.email,
  xp: user.progress?.totalXp ?? 0,
  questCount: Array.isArray(user.tasks) ? user.tasks.filter(t => t.completed).length : 0,
  profileImage: user.profileImage || "",
});

const connectToMongo = async () => {
  if (isDatabaseReady) {
    return true;
  }

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI");
  }

  if (!mongoConnectPromise) {
    mongoConnectPromise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      })
      .then(() => true)
      .catch((err) => {
        mongoLastError = err;
        mongoConnectPromise = null;
        throw err;
      });
  }

  return mongoConnectPromise;
};

connectToMongo().catch((err) => {
  mongoLastError = err;
  console.error("MongoDB initial connection failed:");
  console.error(err.message);
});

const ensureDatabaseReady = async (res) => {
  if (isDatabaseReady) {
    return true;
  }

  try {
    await Promise.race([
      connectToMongo(),
      wait(MONGO_CONNECT_TIMEOUT_MS).then(() => {
        throw new Error("MongoDB connection timed out");
      }),
    ]);

    return true;
  } catch (err) {
    const reason = mongoLastError?.message || err.message;
    console.error("Database unavailable:");
    console.error(reason);
    res.status(503).json({ message: "Database unavailable. Check MongoDB connection settings." });
    return false;
  }
};

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const estimateRoleRisk = (role, index = 0) => {
  const lowered = String(role || "").toLowerCase();
  let baseRisk = 42;

  if (["mechanical", "engineer", "manufacturing", "industrial", "civil"].some((keyword) => lowered.includes(keyword))) {
    baseRisk = 38;
  } else if (["software", "developer", "frontend", "backend", "web", "programmer"].some((keyword) => lowered.includes(keyword))) {
    baseRisk = 58;
  } else if (["designer", "ux", "ui", "graphic", "creative"].some((keyword) => lowered.includes(keyword))) {
    baseRisk = 52;
  } else if (["analyst", "finance", "account", "operations", "data"].some((keyword) => lowered.includes(keyword))) {
    baseRisk = 49;
  }

  const seededOffset = String(role || "")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0) % 9;

  return Math.max(14, Math.min(88, baseRisk + seededOffset - index * 3));
};

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } finally {
    clearTimeout(timeoutId);
  }
}

app.post("/api/signup", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!(await ensureDatabaseReady(res))) {
    return;
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();
    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!(await ensureDatabaseReady(res))) {
    return;
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/profile", authMiddleware, async (req, res) => {
  if (!(await ensureDatabaseReady(res))) {
    return;
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/api/profile", authMiddleware, async (req, res) => {
  if (!(await ensureDatabaseReady(res))) {
    return;
  }

  const profileImage = String(req.body.profileImage || "");

  if (profileImage && !profileImage.startsWith("data:image/") && !profileImage.startsWith("http")) {
    return res.status(400).json({ message: "Profile image must be a valid image or URL." });
  }

  if (profileImage.length > 2_200_000) {
    return res.status(400).json({ message: "Profile image is too large. Use a smaller image." });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profileImage = profileImage;
    await user.save();

    res.json({
      message: "Profile updated",
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/api/profile/password", authMiddleware, async (req, res) => {
  if (!(await ensureDatabaseReady(res))) {
    return;
  }

  const currentPassword = String(req.body.currentPassword || "");
  const newPassword = String(req.body.newPassword || "");

  if (!currentPassword) {
    return res.status(400).json({ message: "Current password is required." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters." });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── GET /api/progress ─────────────────────────────────────────
app.get("/api/progress", authMiddleware, async (req, res) => {
  if (!(await ensureDatabaseReady(res))) return;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      tasks:    user.tasks    || [],
      progress: {
        totalXp:        user.progress?.totalXp        ?? 0,
        totalCompleted: user.progress?.totalCompleted ?? 0,
        dailyHistory:   user.progress?.dailyHistory
                          ? Object.fromEntries(user.progress.dailyHistory)
                          : {},
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── PATCH /api/progress ────────────────────────────────────────
app.patch("/api/progress", authMiddleware, async (req, res) => {
  if (!(await ensureDatabaseReady(res))) return;
  const { tasks, progress } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (Array.isArray(tasks))   user.tasks    = tasks;
    if (progress && typeof progress === "object") {
      user.progress = {
        totalXp:        Number(progress.totalXp)        || 0,
        totalCompleted: Number(progress.totalCompleted) || 0,
        dailyHistory:   progress.dailyHistory || {},
      };
    }
    await user.save();
    res.json({ message: "Progress saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/generate-roadmap", async (req, res) => {
  const { goal } = req.body;

  try {
    const text = await callGemini(
      `Return exactly 5 short roadmap steps for "${goal}". One step per line. No intro.`
    );
    const roadmap = text.split("\n").filter(Boolean).slice(0, 5);

    res.json({ roadmap });
  } catch {
    res.json({ roadmap: ["Learn basics", "Practice", "Build projects"] });
  }
});

app.post("/api/predict-risk", async (req, res) => {
  const { role } = req.body;

  try {
    const text = await callGemini(
      `For "${role}", return one short line only in this exact format: Risk: <number>%`
    );
    res.json({ result: text });
  } catch {
    res.json({ result: `Risk: ${estimateRoleRisk(role)}%` });
  }
});

app.post("/api/compare-roles", async (req, res) => {
  const { roles } = req.body;

  try {
    const text = await callGemini(
      `Compare AI replacement risk for these roles: ${roles.join(", ")}. Return only valid JSON as an array of exactly 3 objects with keys "role" and "risk".`
    );
    res.json({ data: JSON.parse(text) });
  } catch {
    res.json({
      data: roles.map((role, index) => ({
        role,
        risk: estimateRoleRisk(role, index),
      })),
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;