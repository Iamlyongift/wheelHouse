import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import adminRouter from "./routes/admin";

dotenv.config();

const app = express();

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Incoming request:");
  console.log("Origin:", req.headers.origin);
  console.log("Method:", req.method);
  next();
});

// CORS Configuration
const allowedOrigins = [
  "https://admin.cribsandrides.com",
  "https://www.cribsandrides.com",
  "http://localhost:5173",
  "http://localhost:2025",
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// View engine setup
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "jade");

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/product", indexRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);

// Response headers logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Response headers:", res.getHeaders());
  next();
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// Error handler
app.use((err: createError.HttpError, req: Request, res: Response, next: NextFunction) => {
  const isApiRequest = req.originalUrl.startsWith("/api") || 
                       req.originalUrl.startsWith("/users") || 
                       req.originalUrl.startsWith("/admin") || 
                       req.originalUrl.startsWith("/product") ||
                       req.headers.accept?.includes("application/json");
  
  if (isApiRequest) {
    res.status(err.status || 500).json({
      message: err.message || "Something went wrong",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  } else {
    res.status(err.status || 500);
    res.render("error", {
      title: "Error",
      message: err.message,
      error: err,
    });
  }
});

export default app;