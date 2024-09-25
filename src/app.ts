import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import adminRouter from "./routes/admin";
import orderRouter from "./routes/order";
import paymentRouter from "./routes/payment";
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Set up CORS middleware with multiple allowed origins
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://127.0.0.1:5501', 'http://127.0.0.1:5502', 'https://wheelhouse.onrender.com'], // Add your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Include all methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
}));

// Ensure OPTIONS requests are properly handled
app.options('*', cors());
// View engine setup
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Define routes
app.use("/product", indexRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/order", orderRouter);
app.use("/payment", paymentRouter);

// Catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// Error handler
app.use((err: createError.HttpError, req: Request, res: Response, next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

export default app;
