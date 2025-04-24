const express = require('express');
const router = express.Router();
const db = require('../db');

// Înregistrare utilizator
router.post('/register', (req, res) => {
  const { nume, prenume, email, parola } = req.body;

  const sql = 'INSERT INTO users (nume, prenume, email, parola) VALUES (?, ?, ?, ?)';
  db.query(sql, [nume, prenume, email, parola], (err, result) => {
    if (err) return res.status(500).json({ error: 'Eroare înregistrare' });
    res.json({ success: true });
  });
});

// Autentificare utilizator
router.post('/login', (req, res) => {
  const { email, parola } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ? AND parola = ?';
  db.query(sql, [email, parola], (err, results) => {
    if (err) return res.status(500).json({ error: 'Eroare autentificare' });
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.status(401).json({ error: 'Email sau parolă greșită' });
    }
  });
});

module.exports = router;
