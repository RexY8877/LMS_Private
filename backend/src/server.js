const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// static file serving for uploads (we'll create these folders later)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes (you'll create these files next)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use("/api/coding", require("./routes/codingRoutes"));
