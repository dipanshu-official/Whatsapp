import cookieParser from "cookie-parser";
import express from "express"
import cors from "cors";

import authRoutes from "./routes/auth.Route.js";
import chatRoutes from "./routes/chat.Route.js";


const app = express()


app.use(cookieParser());
app.use(cors({
  origin:  "http://localhost:5173",
  credentials: true, // Allow cookies to be sent with requests
}));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Define routes
app.use("/api", authRoutes);
app.use("/api", chatRoutes);


export default app