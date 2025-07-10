import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import "dotenv/config"; // Ensure dotenv is loaded to access environment variables

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5001; // You had 50001 — likely a typo?

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
