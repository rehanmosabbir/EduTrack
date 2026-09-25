import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import studyLogRoutes from "./routes/studyLog.routes.js";
import scoreRoutes from "./routes/score.routes.js";
import noteRoutes from "./routes/note.routes.js";
import goalRoutes from "./routes/goal.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { activitiesRouter, reportsRouter } from "./routes/misc.routes.js";

export function createApp() {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    "/uploads",
    express.static(path.resolve(env.UPLOAD_DIR), {
      fallthrough: true,
      index: false,
    }),
  );

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/students", studentRoutes);
  app.use("/api/subjects", subjectRoutes);
  app.use("/api/study-logs", studyLogRoutes);
  app.use("/api/scores", scoreRoutes);
  app.use("/api/notes", noteRoutes);
  app.use("/api/goals", goalRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/activities", activitiesRouter);
  app.use("/api/reports", reportsRouter);

  app.use(errorHandler);

  return app;
}
