import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, CreditCard, Target, AlertCircle, BarChart3, PieChart, Calendar, DollarSign, Edit3, Save, X, ArrowUpRight, ArrowDownRight, ArrowLeftRight, PiggyBank } from 'lucide-react';
import './DashboardPage.css';
import dashboardService, { DashboardData } from '../services/dashboardService';

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>(dashboardService.getDefaultDashboardData());
  const [editData, setEditData] = useState<DashboardData>(dashboardService.getDefaultDashboardData());
  const [error, setError] = useState<string | null>(null);

  // Încarcă datele dashboard-ului din API
  const loadDashboardData = async (clientId: number) => {
    try {
      setError(null);
      const data = await dashboardService.getDashboardData(clientId);
      
      // Încarcă datele salvate pentru obiectivele financiare personalizate
      const savedData = dashboardService.loadSavedData(clientId);
      if (savedData && savedData.financialGoals) {
        data.financialGoals = savedData.financialGoals;
      }
      
      setDashboardData(data);
      setEditData({ ...data });
    } catch (err) {
      console.error('Eroare la încărcarea datelor dashboard:', err);
      setError('Nu s-au putut încărca datele dashboard-ului. Verifică conexiunea la server.');
      
      // Folosește datele default în caz de eroare
      const defaultData = dashboardService.getDefaultDashboardData();
      setDashboardData(defaultData);
      setEditData({ ...defaultData });
    }
  };

  useEffect(() => {
    // Simulare user logat
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Încarcă datele dashboard-ului pentru utilizatorul logat
      if (parsedUser.id) {
        loadDashboardData(parsedUser.id);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Încarcă datele la montarea componentului
  useEffect(() => {
    if (!loading && user && user.id) {
      loadDashboardData(user.id);
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Se încarcă dashboard-ul...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-error">
        <h2>Acces restricționat</h2>
        <p>Trebuie să fii autentificat pentru a accesa dashboard-ul.</p>
        <Link to="/login" className="login-redirect-btn">
          Conectează-te aici
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Eroare la încărcarea datelor</h2>
        <p>{error}</p>
        <button 
          className="retry-btn" 
          onClick={() => user.id && loadDashboardData(user.id)}
        >
          Încearcă din nou
        </button>
      </div>
    );
  }

  // Funcții pentru editare și salvare
  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...dashboardData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...dashboardData });
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      // Salvează datele personalizate (obiectivele financiare)
      const success = await dashboardService.saveDashboardData(user.id, {
        financialGoals: editData.financialGoals
      });

      if (success) {
        setDashboardData({ ...editData });
        setIsEditing(false);
        alert('Datele au fost salvate cu succes!');
      } else {
        alert('Eroare la salvarea datelor. Încearcă din nou.');
      }
    } catch (error) {
      console.error('Eroare la salvarea datelor:', error);
      alert('Eroare la salvarea datelor. Încearcă din nou.');
    }
  };

  // Funcție pentru a obține iconița corespunzătoare tipului de tranzacție
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowUpRight size={16} className="transaction-icon income-icon" />;
      case 'expense':
        return <ArrowDownRight size={16} className="transaction-icon expense-icon" />;
      case 'savings':
        return <PiggyBank size={16} className="transaction-icon savings-icon" />;
      case 'transfer':
        return <ArrowLeftRight size={16} className="transaction-icon transfer-icon" />;
      default:
        return <DollarSign size={16} className="transaction-icon" />;
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoalChange = (goalId: number, field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      financialGoals: prev.financialGoals.map((goal: any) =>
        goal.id === goalId ? { ...goal, [field]: value } : goal
      )
    }));
  };

  // dashboardData is always defined with defaults

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Dashboard Financiar</h1>
            <p>Bine ai venit înapoi, {user.first_name}! Iată o privire de ansamblu asupra situației tale financiare.</p>
          </div>
          <div className="header-actions">
            {!isEditing ? (
              <button className="edit-btn" onClick={handleEdit}>
                <Edit3 size={20} />
                Editează Datele
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave}>
                  <Save size={20} />
                  Salvează
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  <X size={20} />
                  Anulează
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistici principale */}
      <div className="stats-grid">
        <div className="stat-card balance-card">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Sold Total</h3>
            {isEditing ? (
              <input
                type="number"
                value={editData.totalBalance}
                onChange={(e) => handleInputChange('totalBalance', parseFloat(e.target.value) || 0)}
                className="edit-input"
                step="0.01"
              />
            ) : (
              <div className="stat-value">{dashboardData.totalBalance.toLocaleString('ro-RO')} RON</div>
            )}
          </div>
        </div>

        <div className="stat-card income-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Venit Lunar</h3>
            {isEditing ? (
              <input
                type="number"
                value={editData.monthlyIncome}
                onChange={(e) => handleInputChange('monthlyIncome', parseFloat(e.target.value) || 0)}
                className="edit-input"
                step="0.01"
              />
            ) : (
              <div className="stat-value">{dashboardData.monthlyIncome.toLocaleString('ro-RO')} RON</div>
            )}
          </div>
        </div>

        <div className="stat-card expense-card">
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <h3>Cheltuieli Lunare</h3>
            {isEditing ? (
              <input
                type="number"
                value={editData.monthlyExpenses}
                onChange={(e) => handleInputChange('monthlyExpenses', parseFloat(e.target.value) || 0)}
                className="edit-input"
                step="0.01"
              />
            ) : (
              <div className="stat-value">{dashboardData.monthlyExpenses.toLocaleString('ro-RO')} RON</div>
            )}
          </div>
        </div>

        <div className="stat-card savings-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <h3>Economii</h3>
            {isEditing ? (
              <input
                type="number"
                value={editData.savings}
                onChange={(e) => handleInputChange('savings', parseFloat(e.target.value) || 0)}
                className="edit-input"
                step="0.01"
              />
            ) : (
              <div className="stat-value">{dashboardData.savings.toLocaleString('ro-RO')} RON</div>
            )}
          </div>
        </div>
      </div>

      {/* Secțiunea principală cu grafice și tranzacții */}
      <div className="dashboard-main">
        <div className="dashboard-left">
          {/* Tranzacții recente */}
          <div className="transactions-section">
            <div className="section-header">
              <h2>Tranzacții Recente</h2>
              <Link to="/istoric" className="view-all-link">Vezi toate</Link>
            </div>
            <div className="transactions-list">
              {dashboardData.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
                dashboardData.recentTransactions.map((transaction: any) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-info">
                      <div className="transaction-header">
                        {getTransactionIcon(transaction.type)}
                        <div className="transaction-description">{transaction.other_party || 'Client necunoscut'}</div>
                      </div>
                      <div className="transaction-date">{transaction.date}</div>
                    </div>
                    <div className={`transaction-amount ${transaction.type}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('ro-RO')} RON
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-transactions">
                  <p>Nu există tranzacții recente</p>
                  <p className="no-transactions-subtitle">Tranzacțiile vor apărea aici după ce le vei efectua</p>
                </div>
              )}
            </div>
          </div>

          {/* Categorii de cheltuieli */}
          <div className="spending-section">
            <div className="section-header">
              <h2>Cheltuieli pe Categorii</h2>
              <PieChart size={20} />
            </div>
            <div className="spending-categories">
              {dashboardData.spendingCategories.map((category: any, index: number) => (
                <div key={index} className="category-item">
                  <div className="category-info">
                    <div 
                      className="category-color" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="category-name">{category.category}</span>
                  </div>
                  <div className="category-amount">
                    <span className="amount">{category.amount} RON</span>
                    <span className="percentage">({category.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-right">
          {/* Scorul de credit */}
          <div className="credit-score-section">
            <div className="section-header">
              <h2>Scorul de Credit</h2>
              <Link to="/scor" className="view-all-link">Calculează</Link>
            </div>
            <div className="credit-score-display">
              <div className="score-circle">
                <div className="score-value">{dashboardData.creditScore}</div>
                <div className="score-label">Scor Credit</div>
              </div>
              <div className="score-description">
                <p>Scorul tău de credit este excelent!</p>
                <p>Mai ai 15 puncte până la scorul perfect.</p>
              </div>
            </div>
          </div>

          {/* Obiective financiare */}
          <div className="goals-section">
            <div className="section-header">
              <h2>Obiective Financiare</h2>
              <Target size={20} />
            </div>
            <div className="goals-list">
              {(isEditing ? editData : dashboardData).financialGoals.map((goal: any) => {
                const progress = (goal.current / goal.target) * 100;
                return (
                  <div key={goal.id} className="goal-item">
                    <div className="goal-header">
                      {isEditing ? (
                        <input
                          type="text"
                          value={goal.title}
                          onChange={(e) => handleGoalChange(goal.id, 'title', e.target.value)}
                          className="edit-input-small"
                        />
                      ) : (
                        <h4>{goal.title}</h4>
                      )}
                      {isEditing ? (
                        <input
                          type="date"
                          value={goal.deadline}
                          onChange={(e) => handleGoalChange(goal.id, 'deadline', e.target.value)}
                          className="edit-input-small"
                        />
                      ) : (
                        <span className="goal-deadline">{goal.deadline}</span>
                      )}
                    </div>
                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="progress-text">
                        {isEditing ? (
                          <div className="goal-edit-inputs">
                            <input
                              type="number"
                              value={goal.current}
                              onChange={(e) => handleGoalChange(goal.id, 'current', parseFloat(e.target.value) || 0)}
                              className="edit-input-small"
                              placeholder="Curent"
                            />
                            <span>/</span>
                            <input
                              type="number"
                              value={goal.target}
                              onChange={(e) => handleGoalChange(goal.id, 'target', parseFloat(e.target.value) || 0)}
                              className="edit-input-small"
                              placeholder="Țintă"
                            />
                            <span>RON</span>
                          </div>
                        ) : (
                          `${goal.current.toLocaleString('ro-RO')} / ${goal.target.toLocaleString('ro-RO')} RON`
                        )}
                      </div>
                    </div>
                    <div className="goal-percentage">{Math.round(progress)}% completat</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Acțiuni rapide */}
          <div className="quick-actions-section">
            <div className="section-header">
              <h2>Acțiuni Rapide</h2>
            </div>
            <div className="quick-actions">
              <Link to="/carduri" className="quick-action-btn">
                <CreditCard size={20} />
                <span>Gestionează Cardurile</span>
              </Link>
              <Link to="/scor" className="quick-action-btn">
                <BarChart3 size={20} />
                <span>Calculează Scorul</span>
              </Link>
              <Link to="/istoric" className="quick-action-btn">
                <Calendar size={20} />
                <span>Vezi Istoricul</span>
              </Link>
              <Link to="/alert-settings" className="quick-action-btn">
                <AlertCircle size={20} />
                <span>Setări Alerte</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
