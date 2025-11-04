import React, { useState, useEffect } from 'react';
import { Bell, CreditCard, TrendingDown, Target, Save } from 'lucide-react';
import './AlertSettingsPage.css';

const AlertSettingsPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Stare pentru setările de alerte
  const [alertSettings, setAlertSettings] = useState({
    // Alerte pentru cheltuieli
    expenseAlerts: {
      enabled: true,
      largeExpenseThreshold: 1000,
      dailyExpenseLimit: 200,
      weeklyExpenseLimit: 1000,
      monthlyExpenseLimit: 4000
    },
    // Alerte pentru venituri
    incomeAlerts: {
      enabled: true,
      salaryReceived: true,
      bonusReceived: true,
      irregularIncome: true
    },
    // Alerte pentru economii
    savingsAlerts: {
      enabled: true,
      savingsGoalProgress: 50, // procent
      lowSavingsWarning: 1000,
      savingsTargetReached: true
    },
    // Alerte pentru carduri
    cardAlerts: {
      enabled: true,
      cardExpiryWarning: true, // activat/dezactivat
      unusualSpending: true,
      cardLimitReached: true,
      newCardAdded: true
    },
    // Alerte pentru scorul de credit
    creditScoreAlerts: {
      enabled: true,
      scoreChangeThreshold: 20,
      scoreBelowThreshold: 600,
      monthlyScoreUpdate: true
    },
    // Alerte pentru obiective
    goalAlerts: {
      enabled: true,
      goalDeadlineWarning: 7, // zile înainte
      goalProgressMilestones: [25, 50, 75, 90],
      goalCompleted: true
    },
    // Preferințe de notificare
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
      frequency: 'immediate' // immediate, daily, weekly
    }
  });

  useEffect(() => {
    // Simulare user logat
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setAlertSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    
    try {
      // Simulare salvare setări
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Salvare în localStorage pentru demo
      localStorage.setItem('alertSettings', JSON.stringify(alertSettings));
      
      setSaveMessage('Setările au fost salvate cu succes!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Eroare la salvarea setărilor!');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="alert-settings-loading">
        <div className="loading-spinner"></div>
        <p>Se încarcă setările...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert-settings-error">
        <h2>Acces restricționat</h2>
        <p>Trebuie să fii autentificat pentru a accesa setările de alerte.</p>
      </div>
    );
  }

  return (
    <div className="alert-settings-container">
      <div className="alert-settings-header">
        <div className="header-icon">
          <Bell size={32} />
        </div>
        <div className="header-content">
          <h1>Setări Alerte</h1>
          <p>Configurează notificările pentru a fi la curent cu situația ta financiară</p>
        </div>
      </div>

      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('succes') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      <div className="alert-settings-grid">
        {/* Alerte pentru cheltuieli */}
        <div className="alert-section">
          <div className="section-header">
            <div className="section-icon">
              <TrendingDown size={24} />
            </div>
            <h2>Alerte Cheltuieli</h2>
          </div>
          <div className="settings-group">
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={alertSettings.expenseAlerts.enabled}
                  onChange={(e) => handleSettingChange('expenseAlerts', 'enabled', e.target.checked)}
                />
                <span className="checkmark"></span>
                Activează alerte pentru cheltuieli
              </label>
            </div>
            
            <div className="setting-item">
              <label className="setting-label">
                Prag cheltuială mare (RON):
                <input
                  type="number"
                  value={alertSettings.expenseAlerts.largeExpenseThreshold}
                  onChange={(e) => handleSettingChange('expenseAlerts', 'largeExpenseThreshold', parseInt(e.target.value))}
                  disabled={!alertSettings.expenseAlerts.enabled}
                />
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                Limită cheltuieli zilnice (RON):
                <input
                  type="number"
                  value={alertSettings.expenseAlerts.dailyExpenseLimit}
                  onChange={(e) => handleSettingChange('expenseAlerts', 'dailyExpenseLimit', parseInt(e.target.value))}
                  disabled={!alertSettings.expenseAlerts.enabled}
                />
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                Limită cheltuieli lunare (RON):
                <input
                  type="number"
                  value={alertSettings.expenseAlerts.monthlyExpenseLimit}
                  onChange={(e) => handleSettingChange('expenseAlerts', 'monthlyExpenseLimit', parseInt(e.target.value))}
                  disabled={!alertSettings.expenseAlerts.enabled}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Alerte pentru economii */}
        <div className="alert-section">
          <div className="section-header">
            <div className="section-icon">
              <Target size={24} />
            </div>
            <h2>Alerte Economii</h2>
          </div>
          <div className="settings-group">
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={alertSettings.savingsAlerts.enabled}
                  onChange={(e) => handleSettingChange('savingsAlerts', 'enabled', e.target.checked)}
                />
                <span className="checkmark"></span>
                Activează alerte pentru economii
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                Notifică la progres obiectiv (%):
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={alertSettings.savingsAlerts.savingsGoalProgress}
                  onChange={(e) => handleSettingChange('savingsAlerts', 'savingsGoalProgress', parseInt(e.target.value))}
                  disabled={!alertSettings.savingsAlerts.enabled}
                />
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                Avertizare economii scăzute (RON):
                <input
                  type="number"
                  value={alertSettings.savingsAlerts.lowSavingsWarning}
                  onChange={(e) => handleSettingChange('savingsAlerts', 'lowSavingsWarning', parseInt(e.target.value))}
                  disabled={!alertSettings.savingsAlerts.enabled}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Alerte pentru carduri */}
        <div className="alert-section">
          <div className="section-header">
            <div className="section-icon">
              <CreditCard size={24} />
            </div>
            <h2>Alerte Carduri</h2>
          </div>
          <div className="settings-group">
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={alertSettings.cardAlerts.enabled}
                  onChange={(e) => handleSettingChange('cardAlerts', 'enabled', e.target.checked)}
                />
                <span className="checkmark"></span>
                Activează alerte pentru carduri
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={alertSettings.cardAlerts.cardExpiryWarning}
                  onChange={(e) => handleSettingChange('cardAlerts', 'cardExpiryWarning', e.target.checked)}
                  disabled={!alertSettings.cardAlerts.enabled}
                />
                <span className="checkmark"></span>
                Avertizare expirare card (30 zile înainte)
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={alertSettings.cardAlerts.unusualSpending}
                  onChange={(e) => handleSettingChange('cardAlerts', 'unusualSpending', e.target.checked)}
                  disabled={!alertSettings.cardAlerts.enabled}
                />
                <span className="checkmark"></span>
                Alerte cheltuieli neobișnuite
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={alertSettings.cardAlerts.cardLimitReached}
                  onChange={(e) => handleSettingChange('cardAlerts', 'cardLimitReached', e.target.checked)}
                  disabled={!alertSettings.cardAlerts.enabled}
                />
                <span className="checkmark"></span>
                Alerte limită card atinsă
              </label>
            </div>
          </div>
        </div>

        {/* Preferințe notificare */}
        <div className="alert-section">
          <div className="section-header">
            <div className="section-icon">
              <Bell size={24} />
            </div>
            <h2>Preferințe Notificare</h2>
          </div>
          <div className="settings-group">
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={alertSettings.notificationPreferences.email}
                  onChange={(e) => handleSettingChange('notificationPreferences', 'email', e.target.checked)}
                />
                <span className="checkmark"></span>
                Notificări prin email
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={alertSettings.notificationPreferences.push}
                  onChange={(e) => handleSettingChange('notificationPreferences', 'push', e.target.checked)}
                />
                <span className="checkmark"></span>
                Notificări push
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={alertSettings.notificationPreferences.sms}
                  onChange={(e) => handleSettingChange('notificationPreferences', 'sms', e.target.checked)}
                />
                <span className="checkmark"></span>
                Notificări SMS
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                Frecvența notificărilor:
                <select
                  value={alertSettings.notificationPreferences.frequency}
                  onChange={(e) => handleSettingChange('notificationPreferences', 'frequency', e.target.value)}
                >
                  <option value="immediate">Imediat</option>
                  <option value="daily">Zilnic</option>
                  <option value="weekly">Săptămânal</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="alert-settings-actions">
        <button 
          className="save-button" 
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={20} />
          {saving ? 'Se salvează...' : 'Salvează Setările'}
        </button>
      </div>
    </div>
  );
};

export default AlertSettingsPage;
