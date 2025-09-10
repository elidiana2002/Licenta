import React from 'react';
import { BookOpenCheck, AlertTriangle, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  // Obiecte pentru carduri pentru a evita duplicarea codului
  const features = [
    {
      icon: BookOpenCheck,
      title: "Educație Financiară Avansată",
      description: "Dezvoltă-ți competențele financiare prin cursuri interactive, ghiduri practice și instrumente de analiză personalizate pentru o gestionare inteligentă a banilor."
    },
    {
      icon: AlertTriangle,
      title: "Monitorizare Inteligentă",
      description: "Sistem avansat de notificări care te alertează despre cheltuieli neobișnuite, oportunități de investiții și obiectivele tale financiare."
    },
    {
      icon: TrendingDown,
      title: "Optimizare Financiară",
      description: "Algoritmi AI care identifică tiparele de cheltuieli, sugerează îmbunătățiri și te ghidează către decizii financiare mai bune."
    }
  ];

  return (
    <div className="homepage-container">
      <div className="homepage-card">
        <h1 className="homepage-title">Bine ai venit la FinEdu!</h1>
        <p className="homepage-description">
          Platforma ta personală de educație financiară și management inteligent al banilor. Transformă-ți abordarea față de finanțe prin tehnologie avansată, analiză predictivă și ghidare personalizată către independența financiară.
        </p>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon as React.ElementType;
            return (
              <div key={index} className="feature-card">
                <Icon className="feature-icon" />
                <h2 className="feature-title">{feature.title}</h2>
                <p className="feature-description">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <Link to="/dashboard" className="cta-button">
          🚀 Începe Transformarea Financiară
        </Link>
      </div>
    </div>
  );
};

export default HomePage;