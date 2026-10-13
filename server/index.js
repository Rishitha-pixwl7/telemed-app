   require('dotenv').config();
   const mongoose = require('mongoose');

   mongoose.connect(process.env.MONGODB_URI)
     .then(() => console.log('MongoDB connected'))
     .catch(err => console.error('MongoDB error:', err.message));



const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

   app.use('/api/auth', require('./routes/auth'));
   
const PORT = process.env.PORT || 5001;

app.listen(PORT, (error) => {
  if (error) {
    console.error("Server failed to start:", error.message);
    return;
  }
  console.log(`Server running on port ${PORT}`);
});
