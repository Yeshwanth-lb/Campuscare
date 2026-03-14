import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import connectDB from "./server/config/db.ts";
import authRoutes from "./server/routes/authRoutes";
import complaintRoutes from "./server/routes/complaintRoutes";
import lostFoundRoutes from "./server/routes/lostFoundRoutes";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Connect to database
  await connectDB();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/lostfound', lostFoundRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
