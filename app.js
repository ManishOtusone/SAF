// ✅ Load env FIRST before anything else
require("dotenv").config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const index = require('./routers/index');

// Optional: You don’t need this line anymore
// const dotenv = require('dotenv');

const app = express();

console.log("Cloudinary ENV check:", process.env.CLOUD_NAME, process.env.CLOUD_API_KEY);

// ✅ Connect to database (after env vars are loaded)
const db = require('./config/db');

app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '15mb' }));

// ✅ API routes
app.use('/api/v1.0', index);

// ✅ Serve client build
const buildPath = path.join(__dirname, './client', 'dist');
app.use(express.static(buildPath));

// ✅ SPA fallback (for React Router)
app.use((req, res, next) => {
    if (!req.originalUrl.startsWith('/api')) {
        res.sendFile(path.join(buildPath, 'index.html'));
    } else {
        next();
    }
});

// ✅ Start server
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`✅ Server running at port ${PORT}`);
});
