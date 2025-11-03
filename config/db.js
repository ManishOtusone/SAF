
const mongoose = require('mongoose');
const dbURL = process.env.MONGO_URI;

mongoose.connect(dbURL)
  .then(async () => {
    console.log('Connected to MongoDB');
    
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

module.exports = mongoose.connection;