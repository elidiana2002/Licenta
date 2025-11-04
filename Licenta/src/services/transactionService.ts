import axios from 'axios';

const API_BASE_URL = 'http://localhost/api';

export interface Transaction {
  id: number;
  account_id: number;
  destination_account_id?: number;
  amount: number;
  currency: string;
  status: string;
  transaction_type: string;
  method: string;
  category: string;
  description: string;
  source_balance_after?: number;
  destination_balance_after?: number;
  created_at: string;
  source_client_name: string;
  source_currency: string;
  account_iban: string;
  source_account_number: string;
  destination_client_name?: string;
  destination_currency?: string;
  destination_account_iban?: string;
  source_bank_name: string;
  destination_bank_name?: string;
  transaction_direction: 'incoming' | 'outgoing' | 'internal';
  other_party: string;
  status_display: string;
  type_icon: string;
  method_icon: string;
  amount_formatted: string;
  source_balance_after_formatted?: string;
  destination_balance_after_formatted?: string;
}

export interface TransactionResponse {
  success: boolean;
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  error?: string;
}

export interface Card {
  id: number;
  card_id: number;
  card_number: string;
  card_type: string;
  expiry_date: string;
  status: string;
  account_id: number;
  account_iban: string;
  account_ibans: string[];
  balance: number;
  currency: string;
  bank_name: string;
  accounts_count: number;
}

export interface CardResponse {
  success: boolean;
  cards: Card[];
  error?: string;
}

class TransactionService {
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

  // Obține tranzacțiile pentru un client
  async getTransactions(
    clientId: number, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<TransactionResponse> {
    return await this.makeApiCall<TransactionResponse>('getTransactions.php', {
      client_id: clientId,
      limit: limit,
      offset: offset
    });
  }

  // Obține cardurile pentru un client
  async getCardsByClient(clientId: number): Promise<CardResponse> {
    return await this.makeApiCall<CardResponse>('getCardsByClient.php', {
      client_id: clientId
    });
  }

  // Procesează o acțiune asupra unei tranzacții
  async processTransferAction(
    transactionId: number, 
    action: 'accept' | 'reject' | 'return' | 'cancel'
  ): Promise<{ success: boolean; error?: string }> {
    return await this.makeApiCall<{ success: boolean; error?: string }>('processTransferNotification.php', {
      transaction_id: transactionId,
      action: action
    });
  }

  // Repetă o tranzacție
  async repeatTransfer(transferData: any): Promise<{ success: boolean; error?: string }> {
    return await this.makeApiCall<{ success: boolean; error?: string }>('transferBetweenAccounts.php', transferData);
  }

  // Filtrează tranzacțiile după status
  filterTransactionsByStatus(transactions: Transaction[], status: string): Transaction[] {
    if (status === 'all') return transactions;
    return transactions.filter(transaction => transaction.status === status);
  }

  // Sortează tranzacțiile
  sortTransactions(
    transactions: Transaction[], 
    sortBy: 'date' | 'amount' | 'status' | 'account',
    sortOrder: 'asc' | 'desc'
  ): Transaction[] {
    return [...transactions].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'account':
          comparison = a.account_iban.localeCompare(b.account_iban);
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  // Formatează data pentru afișare
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Formatează suma pentru afișare
  formatAmount(amount: number, currency: string = 'RON'): string {
    return `${amount.toFixed(2)} ${currency}`;
  }

  // Obține culoarea pentru status
  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
      case 'accepted':
        return '#27ae60'; // Verde
      case 'pending':
        return '#f39c12'; // Portocaliu
      case 'rejected':
        return '#e74c3c'; // Roșu
      case 'returned':
        return '#e74c3c'; // Roșu
      case 'cancelled':
        return '#95a5a6'; // Gri
      default:
        return '#3498db'; // Albastru
    }
  }

  // Obține culoarea pentru suma
  getAmountColor(amount: number, direction: string): string {
    if (direction === 'incoming' || amount > 0) {
      return '#27ae60'; // Verde pentru venituri
    } else {
      return '#e74c3c'; // Roșu pentru cheltuieli
    }
  }

  // Verifică dacă o tranzacție poate fi repetată
  canRepeatTransaction(transaction: Transaction): boolean {
    return transaction.transaction_direction === 'outgoing' && 
           transaction.status === 'completed' &&
           transaction.method !== 'ATM';
  }

  // Pregătește datele pentru repetarea unei tranzacții
  prepareRepeatData(transaction: Transaction): any {
    return {
      amount: Math.abs(transaction.amount),
      currency: transaction.currency,
      destination_client_name: transaction.other_party,
      source_client_name: transaction.source_client_name,
      transaction_direction: transaction.transaction_direction,
      original_transaction_id: transaction.id,
      fromAccountId: transaction.account_id,
      description: `Repetare tranzacție ${transaction.id}`
    };
  }
}

export default new TransactionService();
