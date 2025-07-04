import express from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
const router = express.Router();

// Înregistrare client
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password, CNP, address, phone } = req.body;
  console.log('Date primite la /register:', req.body);

  if (!first_name || !last_name || !email || !password || !CNP) {
    console.log('Lipsesc câmpuri obligatorii');
    return res.status(400).json({ error: 'Toate câmpurile obligatorii trebuie completate.' });
  }

  // Verifică dacă emailul sau CNP-ul există deja
  db.query('SELECT * FROM clients WHERE email = ? OR CNP = ?', [email, CNP], async (err, results) => {
    if (err) {
      console.log('Eroare la verificarea existenței clientului:', err);
      return res.status(500).json({ error: 'Eroare la verificarea existenței clientului.' });
    }
    if (results.length > 0) {
      console.log('Emailul sau CNP-ul există deja');
      return res.status(409).json({ error: 'Emailul sau CNP-ul există deja.' });
    }

    // Hash-uiește parola
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Inserează clientul
    const sql = 'INSERT INTO clients (first_name, last_name, email, password_hash, CNP, address, phone) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [first_name, last_name, email, password_hash, CNP, address, phone], (err, result) => {
      if (err) {
        console.log('Eroare la inserare client:', err);
        return res.status(500).json({ error: 'Eroare la înregistrare.' });
      }
      console.log('Client inserat cu succes:', result);
      res.json({ success: true });
    });
  });
});

// Autentificare client
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM clients WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Eroare la autentificare.' });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Email sau parolă greșită.' });
    }
    const client = results[0];
    const match = await bcrypt.compare(password, client.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Email sau parolă greșită.' });
    }
    res.json({ success: true, client: { id: client.id, first_name: client.first_name, last_name: client.last_name, email: client.email } });
  });
});

export default router;
