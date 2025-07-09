import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5001; // You had 50001 — likely a typo?

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
