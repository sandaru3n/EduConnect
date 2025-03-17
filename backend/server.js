// backend/server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const subscriptionRoutes = require('./routes/subscriptionRoutes');




dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Match Vite's default port
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true 
  }));

const eBookRoutes = require('./routes/eBookRoutes');
app.use('/api/ebooks', eBookRoutes);

const classRoutes = require('./routes/classRoutes');
app.use('/api/classes', classRoutes);


const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

const refundRoutes = require('./routes/refundRoutes');
app.use('/api/refunds', refundRoutes);

// Serve static files
app.use('/uploads/ebooks', express.static(path.join(__dirname, 'src/public/uploads/ebooks')));
app.use('/uploads/covers', express.static(path.join(__dirname, 'src/public/uploads/covers')));


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/teacher", require("./routes/teacherRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/pages", require("./routes/pageRoutes"));
app.use('/api/subscriptions', subscriptionRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
  });




  app.use("/uploads/materials", express.static(path.join(__dirname, "uploads/materials")));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
