import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import adminRouter from "./routes/admin";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Add this before your CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Incoming request:");
  console.log("Origin:", req.headers.origin);
  console.log("Method:", req.method);
  next();
});

// CORS Configuration
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void
  ) {
    const allowedOrigins = [
      "https://admin.cribsandrides.com",
      "https://www.cribsandrides.com",
      "http://localhost:5174", // Your frontend port
      "http://localhost:2025", // Your backend port
    ];

    // For development debugging
    console.log("Incoming request from origin:", origin);

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
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

// Handle preflight requests
app.options("*", cors(corsOptions));

// View engine setup
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// Define routes
app.use("/product", indexRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);

// Add this after your CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Response headers:", res.getHeaders());
  next();
});

// Catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// Error handler
app.use(
  (
    err: createError.HttpError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
  }
);

export default app;
