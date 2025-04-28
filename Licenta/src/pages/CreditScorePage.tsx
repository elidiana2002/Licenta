//src\pages\CreditScorePage.tsx
import React, { useState } from "react";
import "../App.css";



const CreditScorePage = () => {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [debts, setDebts] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // SCHIMBĂ ASTA după ce ai autentificare reală

  const calculateScore = () => {
    const incomeVal = parseFloat(income) || 0;
    const expensesVal = parseFloat(expenses) || 0;
    const debtsVal = parseFloat(debts) || 0;
    const calculatedScore = incomeVal - expensesVal - (debtsVal * 2);
    setScore(calculatedScore);
  };

  const clearInputs = () => {
    setIncome('');
    setExpenses('');
    setDebts('');
    setScore(null);
  };

  const fetchAutomaticData = (): void => {
    console.log("Funcția automată: va aduce date din BD dacă userul este logat");
  };

  // Funcție care permite doar numere în input
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>): void => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) { // Acceptă doar cifre și un singur punct
      setter(value);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Calculează-ți Scorul de Credit</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={fetchAutomaticData}
            disabled={!isLoggedIn}
            className="general-button"
            style={{ flex: 1, marginRight: '0.5rem', opacity: isLoggedIn ? 1 : 0.6 }}
          >
            Auto date BD
          </button>
          <button
            onClick={clearInputs}
            className="general-button"
            style={{ flex: 1, marginLeft: '0.5rem', backgroundColor: '#e74c3c', color: 'white' }}
          >
            Resetare
          </button>
        </div>

        {!isLoggedIn && (
          <p style={{ fontSize: '0.9rem', color: '#e74c3c', marginBottom: '1rem', textAlign: 'center' }}>
            *Necesită autentificare pentru a folosi funcția automată
          </p>
        )}

        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); calculateScore(); }}>
          <input
            type="number"
            placeholder="Venit lunar (€)"
            value={income}
            onChange={(e) => handleNumericInput(e, setIncome)}
          />
          <input
            type="number"
            placeholder="Cheltuieli lunare (€)"
            value={expenses}
            onChange={(e) => handleNumericInput(e, setExpenses)}
          />
          <input
            type="number"
            placeholder="Datorii totale (€)"
            value={debts}
            onChange={(e) => handleNumericInput(e, setDebts)}
          />
          <button type="submit" className="general-button">Calculează</button>
        </form>

        {score !== null && (
          <div style={{ marginTop: "1.5rem", fontSize: "1.5rem", color: "#2a2a2a" }}>
            Scorul tău este: {score}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditScorePage;
