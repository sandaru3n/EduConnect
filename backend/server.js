// backend/server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const faqRoutes = require('./routes/faqRoutes');
const knowledgebaseRoutes = require('./routes/knowledgebaseRoutes');




dotenv.config();
connectDB();

const app = express();
// Debug environment variables
console.log("Gemini API Key:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");


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

const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contact', contactRoutes);


app.use('/api/faqs', faqRoutes);
// Serve static files
app.use('/uploads/ebooks', express.static(path.join(__dirname, 'src/public/uploads/ebooks')));
app.use('/uploads/covers', express.static(path.join(__dirname, 'src/public/uploads/covers')));
app.use('/uploads/refunds', express.static(path.join(__dirname, 'uploads/refunds')));

app.use('/uploads/documents', express.static(path.join(__dirname, 'src/public/uploads/documents')));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'src/public/uploads')));



app.use('/api/knowledgebase', knowledgebaseRoutes);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/teacher", require("./routes/teacherRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use('/api/doubt', require('./routes/doubtRoutes')); // New doubt routes

app.use("/api/pages", require("./routes/pageRoutes"));
app.use('/api/subscriptions', subscriptionRoutes);

app.use('/api/quiz', require('./routes/quizRoutes')); // New quiz routes

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
  });




  app.use("/uploads/materials", express.static(path.join(__dirname, "uploads/materials")));


// Study pack routes
const studyPackRoutes = require('./routes/studyPackRoutes');
app.use('/api/studypacks', studyPackRoutes); // Check: Must export Router
app.use('/uploads/studypacks', express.static(path.join(__dirname, 'src/public/uploads/studypacks')));

// New message routes
app.use('/api/messages', require('./routes/messageRoutes'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
