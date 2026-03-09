require("dotenv").config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const index = require('./routers/index');


const app = express();

console.log("Cloudinary ENV check:", process.env.CLOUD_NAME, process.env.CLOUD_API_KEY);

const db = require('./config/db');

app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.use('/api/v1.0', index);

const buildPath = path.join(__dirname, './client', 'dist');
app.use(express.static(buildPath));
app.use("/public", express.static("public"));

app.use((req, res, next) => {
    if (!req.originalUrl.startsWith('/api')) {
        res.sendFile(path.join(buildPath, 'index.html'));
    } else {
        next();
    }
});

const PORT = process.env.PORT || 8001;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`✅ Server running at port ${PORT}`);
});
