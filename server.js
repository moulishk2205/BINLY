const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ ADD THIS LINE HERE
app.use(express.static("public"));

// Import Routes
const authRoutes = require("./routes/auth");
const citizenRoutes = require("./routes/citizen");
const collectorRoutes = require("./routes/collector");
const adminRoutes = require("./routes/admin");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/citizen", citizenRoutes);
app.use("/api/collector", collectorRoutes);
app.use("/api/admin", adminRoutes);

// Test route
//app.get("/", (req, res) => {
  //res.send("🚀 Binly Backend Running Successfully");
//});

// PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});