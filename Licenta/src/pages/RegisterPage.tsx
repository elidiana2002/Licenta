import { Link } from "react-router-dom";
import { useState } from "react";
import "../App.css";

const RegisterPage = () => {
  // definim state pentru fiecare input
  const [nume, setNume] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [parola, setParola] = useState<string>('');
  const [confirmaParola, setConfirmaParola] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // oprește refresh-ul paginii

    // Aici ai acces la date
    console.log({
      nume,
      email,
      parola,
      confirmaParola
    });

    // Exemplu: aici ai putea trimite datele la API
    /*
    fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nume, email, parola, confirmaParola }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Succes:', data);
      })
      .catch((error) => {
        console.error('Eroare:', error);
      });
    */
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Crează Cont</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nume complet"
            value={nume}
            onChange={(e) => setNume(e.target.value)}
            required
          /><br /><br />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /><br /><br />

          <input
            type="password"
            placeholder="Parolă"
            value={parola}
            onChange={(e) => setParola(e.target.value)}
            required
          /><br /><br />

          <input
            type="password"
            placeholder="Confirmă Parola"
            value={confirmaParola}
            onChange={(e) => setConfirmaParola(e.target.value)}
            required
          /><br /><br />

          <button type="submit">Crează Cont</button>
        </form>

        <div className="redirect">
          Ai deja cont? <Link to="/login">Intră aici</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
