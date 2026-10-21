// Force Node to use Google DNS so MongoDB Atlas SRV lookups (mongodb+srv://) work
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const applicationRoutes = require("./src/routes/applicationRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");
const registerChatSocket = require("./src/sockets/chatSocket");

const required = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];
for (const key of required) {
  if (
    !process.env[key] ||
    /(change|placeholder|example|your_|replace)/i.test(process.env[key])
  ) {
    console.error(`Missing or unsafe required environment variable: ${key}`);
    process.exit(1);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must contain at least 32 characters.");
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL.split(",").map((value) => value.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: "100kb" }));
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Try again later." },
});

app.get("/", (req, res) => res.send("Student Marketplace API is running"));
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL.split(",").map((value) => value.trim()),
    credentials: true,
  },
});
registerChatSocket(io);

const PORT = Number(process.env.PORT || 5000);
connectDB().then(() =>
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
);