"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./routes/index"));
const users_1 = __importDefault(require("./routes/users"));
const admin_1 = __importDefault(require("./routes/admin"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((req, res, next) => {
    console.log("Incoming request:");
    console.log("Origin:", req.headers.origin);
    console.log("Method:", req.method);
    next();
});
const allowedOrigins = [
    "https://admin.cribsandrides.com",
    "https://www.cribsandrides.com",
    "http://localhost:5173",
    "http://localhost:2025",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
};
app.use((0, cors_1.default)(corsOptions));
app.options("*", (0, cors_1.default)(corsOptions));
app.set("views", path_1.default.join(__dirname, "../views"));
app.set("view engine", "jade");
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
app.use("/product", index_1.default);
app.use("/users", users_1.default);
app.use("/admin", admin_1.default);
app.use((req, res, next) => {
    console.log("Response headers:", res.getHeaders());
    next();
});
app.use((req, res, next) => {
    next((0, http_errors_1.default)(404));
});
app.use((err, req, res, next) => {
    var _a;
    const isApiRequest = req.originalUrl.startsWith("/api") ||
        req.originalUrl.startsWith("/users") ||
        req.originalUrl.startsWith("/admin") ||
        req.originalUrl.startsWith("/product") ||
        ((_a = req.headers.accept) === null || _a === void 0 ? void 0 : _a.includes("application/json"));
    if (isApiRequest) {
        res.status(err.status || 500).json({
            message: err.message || "Something went wrong",
            error: process.env.NODE_ENV === "development" ? err : {},
        });
    }
    else {
        res.status(err.status || 500);
        res.render("error", {
            title: "Error",
            message: err.message,
            error: err,
        });
    }
});
exports.default = app;
