const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// POST /api/auth/register  →  creates a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, specialization } = req.body;

    // 1. Check if this email is already used
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 2. Scramble (hash) the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      specialization,
    });

    // 4. Send back the user (without the password)
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;