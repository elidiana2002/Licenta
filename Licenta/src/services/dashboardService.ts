import axios from 'axios';

const API_BASE_URL = 'http://localhost/api';

// Interfață pentru datele dashboard-ului
export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  creditScore: number;
  recentTransactions: Transaction[];
  financialGoals: FinancialGoal[];
  spendingCategories: SpendingCategory[];
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'savings' | 'transfer';
  date: string;
  status?: string;
  method?: string;
  category?: string;
  other_party?: string;
}

export interface FinancialGoal {
  id: number;
  title: string;
  target: number;
  current: number;
  deadline: string;
}

export interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface AccountBalance {
  id: number;
  iban: string;
  balance: number;
  currency: string;
  account_type: string;
  bank_name: string;
}

export interface ApiTransaction {
  id: number;
  amount: number;
  description: string;
  transaction_type: string;
  method: string;
  category: string;
  created_at: string;
  transaction_direction: 'incoming' | 'outgoing' | 'internal';
  other_party: string;
  status_display: string;
}

export interface CreditScoreData {
  income: number;
  expenses: number;
  debts: number;
  total_balance: number;
}

class DashboardService {
  private async makeApiCall<TResponse>(endpoint: string, data: any): Promise<TResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/${endpoint}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data as TResponse;
    } catch (error) {
      console.error(`Eroare la apelul API ${endpoint}:`, error);
      throw error;
    }
  }

  // Obține datele complete pentru dashboard
  async getDashboardData(clientId: number): Promise<DashboardData> {
    try {
      // Obține datele în paralel
      const [balancesData, transactionsData, creditScoreData] = await Promise.all([
        this.getAccountBalances(clientId),
        this.getRecentTransactions(clientId, 10), // Ultimele 10 tranzacții
        this.getCreditScoreData(clientId)
      ]);

      // Calculează datele pentru dashboard
      const totalBalance = balancesData.total_balance || 0;
      const monthlyIncome = creditScoreData.income || 0;
      const monthlyExpenses = creditScoreData.expenses || 0;
      const savings = Math.max(0, monthlyIncome - monthlyExpenses);

      // Calculează credit score-ul (simplificat)
      const creditScore = this.calculateCreditScore(totalBalance, monthlyIncome, monthlyExpenses);

      // Formatează tranzacțiile pentru dashboard
      const recentTransactions = this.formatTransactions(transactionsData.transactions || []);

      // Calculează categoriile de cheltuieli
      const spendingCategories = this.calculateSpendingCategories(transactionsData.transactions || []);

      // Obiective financiare (pentru moment statice, dar pot fi dinamic calculate)
      const financialGoals = this.getDefaultFinancialGoals();

      return {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        savings,
        creditScore,
        recentTransactions,
        financialGoals,
        spendingCategories
      };
    } catch (error) {
      console.error('Eroare la încărcarea datelor dashboard:', error);
      // Returnează datele default în caz de eroare
      return this.getDefaultDashboardData();
    }
  }

  // Obține soldurile conturilor
  private async getAccountBalances(clientId: number): Promise<{ total_balance: number; accounts?: AccountBalance[] }> {
    return await this.makeApiCall<{ total_balance: number; accounts?: AccountBalance[] }>('getAccountBalances.php', { client_id: clientId });
  }

  // Obține tranzacțiile recente
  private async getRecentTransactions(clientId: number, limit: number = 10): Promise<{ transactions: ApiTransaction[] }> {
    return await this.makeApiCall<{ transactions: ApiTransaction[] }>('getTransactions.php', { 
      client_id: clientId, 
      limit: limit,
      offset: 0
    });
  }

  // Obține datele pentru credit score
  private async getCreditScoreData(clientId: number): Promise<CreditScoreData> {
    return await this.makeApiCall<CreditScoreData>('getCreditScoreData.php', { client_id: clientId });
  }

  // Calculează credit score-ul (algoritm simplificat)
  private calculateCreditScore(balance: number, income: number, expenses: number): number {
    if (balance <= 0 || income <= 0) return 300; // Scor foarte mic

    const debtToIncomeRatio = expenses / income;
    const savingsRate = (income - expenses) / income;

    let score = 300; // Scor de bază

    // Bonus pentru sold pozitiv
    if (balance > 10000) score += 100;
    else if (balance > 5000) score += 50;
    else if (balance > 1000) score += 25;

    // Bonus pentru rata de economii
    if (savingsRate > 0.3) score += 100;
    else if (savingsRate > 0.2) score += 75;
    else if (savingsRate > 0.1) score += 50;

    // Penalizare pentru raportul datorie/venit
    if (debtToIncomeRatio > 0.8) score -= 100;
    else if (debtToIncomeRatio > 0.6) score -= 50;
    else if (debtToIncomeRatio > 0.4) score -= 25;

    return Math.min(850, Math.max(300, score));
  }

  // Formatează tranzacțiile pentru dashboard
  private formatTransactions(apiTransactions: ApiTransaction[]): Transaction[] {
    return apiTransactions.map(transaction => ({
      id: transaction.id,
      description: transaction.description || `${transaction.transaction_type} - ${transaction.other_party}`,
      amount: transaction.transaction_direction === 'incoming' ? 
        Math.abs(transaction.amount) : -Math.abs(transaction.amount),
      type: this.mapTransactionType(transaction.transaction_type, transaction.transaction_direction),
      date: this.formatDate(transaction.created_at),
      status: transaction.status_display,
      method: transaction.method,
      category: transaction.category,
      other_party: transaction.other_party
    }));
  }

  // Mapează tipul de tranzacție API la tipul dashboard
  private mapTransactionType(apiType: string, direction: string): 'income' | 'expense' | 'savings' | 'transfer' {
    if (direction === 'incoming') return 'income';
    if (direction === 'outgoing') return 'expense';
    if (apiType === 'transfer') return 'transfer';
    return 'expense';
  }

  // Formatează data pentru afișare
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Calculează categoriile de cheltuieli
  private calculateSpendingCategories(transactions: ApiTransaction[]): SpendingCategory[] {
    const categories: { [key: string]: number } = {};
    let totalExpenses = 0;

    // Grupează cheltuielile pe categorii
    transactions.forEach(transaction => {
      if (transaction.transaction_direction === 'outgoing') {
        const category = transaction.category || 'Altele';
        const amount = Math.abs(transaction.amount);
        categories[category] = (categories[category] || 0) + amount;
        totalExpenses += amount;
      }
    });

    // Calculează procentele și creează obiectele
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    let colorIndex = 0;

    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100 * 10) / 10 : 0,
      color: colors[colorIndex++ % colors.length]
    }));
  }

  // Obiective financiare default
  private getDefaultFinancialGoals(): FinancialGoal[] {
    return [
      { id: 1, title: "Fond de urgență", target: 10000, current: 0, deadline: "31.12.2025" },
      { id: 2, title: "Vacanță", target: 3000, current: 0, deadline: "15.06.2025" },
      { id: 3, title: "Investiții", target: 5000, current: 0, deadline: "30.11.2025" }
    ];
  }

  // Datele default în caz de eroare
  getDefaultDashboardData(): DashboardData {
    return {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      savings: 0,
      creditScore: 300,
      recentTransactions: [],
      financialGoals: this.getDefaultFinancialGoals(),
      spendingCategories: []
    };
  }

  // Salvează datele dashboard-ului (pentru obiectivele financiare personalizate)
  async saveDashboardData(clientId: number, data: Partial<DashboardData>): Promise<boolean> {
    try {
      // Pentru moment, salvăm doar în localStorage
      // În viitor, putem crea un endpoint pentru a salva obiectivele financiare
      localStorage.setItem(`dashboardData_${clientId}`, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Eroare la salvarea datelor dashboard:', error);
      return false;
    }
  }

  // Încarcă datele salvate
  loadSavedData(clientId: number): Partial<DashboardData> | null {
    try {
      const saved = localStorage.getItem(`dashboardData_${clientId}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Eroare la încărcarea datelor salvate:', error);
      return null;
    }
  }
}

export default new DashboardService();
