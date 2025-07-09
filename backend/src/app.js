import cors from "cors";

// Add CORS middleware before any routes
app.use(
  cors({
    origin: "http://localhost:5173", // Change to your frontend URL if different
    credentials: true,
  })
);

// Ensure session/auth middleware is set up here (if using express-session or similar)
