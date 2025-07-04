import React from 'react';
import { BookOpenCheck, AlertTriangle, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  // Obiecte pentru carduri pentru a evita duplicarea codului
  const features = [
    {
      icon: BookOpenCheck,
      title: "Educație Financiară",
      description: "Învață cum să gestionezi bugetul, economiile și cheltuielile tale."
    },
    {
      icon: AlertTriangle,
      title: "Alerta de Cheltuieli Mari",
      description: "Primești notificări când faci cumpărături neobișnuit de mari."
    },
    {
      icon: TrendingDown,
      title: "Evită Capcanele",
      description: "Identifică tiparele negative și îmbunătățește-ți obiceiurile."
    }
  ];

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-6 md:p-8 text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-600">Bine ai venit la FinEdu!</h1>
        <p className="text-gray-700 text-base md:text-lg">
          Aplicația noastră te ajută să îți înțelegi mai bine finanțele, să devii mai responsabil și să îți îmbunătățești obiceiurile financiare.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
          {features.map((feature, index) => {
            const Icon = feature.icon as React.ElementType;
            return (
              <div key={index} className="bg-yellow-100 p-4 rounded-xl shadow hover:shadow-md transition-shadow">
                <Icon className="mx-auto text-yellow-700 w-10 h-10" />
                <h2 className="font-semibold mt-3 text-yellow-800">{feature.title}</h2>
                <p className="text-sm text-gray-600 mt-2">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <Link
          to="/dashboard"
          className="inline-block mt-8 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full text-base md:text-lg transition-colors duration-300"
        >
          Începe să îți analizezi finanțele
        </Link>
      </div>
    </div>
  );
};

export default HomePage;