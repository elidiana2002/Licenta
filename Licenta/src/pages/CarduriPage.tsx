import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './CarduriPage.css';

interface Card {
  id: number;
  account_id: number;
  card_number: string;
  expiration_date: string;
  cvv: string;
  status: string;
  card_type: string;
  issued_at: string;
  bank_id: number;
  currency: string;
  bank_name: string;
  balance?: number | null;
  iban?: string;
  accounts?: AccountDetails[];
}

interface GetClientResponse {
  success: boolean;
  client?: { id: number };
  error?: string;
}

interface GetAccountsResponse {
  success: boolean;
  cards?: { card_id: number; card_number: string; card_type: string; expiration_date: string; status: string; account_ibans: string; accounts_count: number }[];
  error?: string;
}

interface GetCardsResponse {
  success: boolean;
  cards: (Card & { balance?: number | null; iban?: string })[];
  error?: string;
}

interface SimpleResponse {
  success: boolean;
  error?: string;
  debug?: any;
  message?: string;
}

interface AccountDetails {
  id: number;
  iban: string;
  balance: number | null;
  currency: string;
  bank_name: string;
  created_at: string;
  bank_id?: number; // Adăugat bank_id
}

// Funcții de criptare/decriptare simple
const ENCRYPTION_KEY = 'licenta2024';

// TEMPORAR: Eliminăm criptarea pentru a face aplicația să funcționeze
const encryptData = (data: string): string => {
  return data; // Returnează datele necriptate
};

// TEMPORAR: Eliminăm decriptarea pentru a face aplicația să funcționeze
const decryptData = (encryptedData: string): string => {
  return encryptedData; // Returnează datele fără decriptare
};

const CarduriPage: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [form, setForm] = useState({
    card_number: '',
    expiration_date: '',
    cvv: '',
    card_type: 'debit',
    bank_id: '',
    status: 'active',
    currency: 'RON',
  });
  const [useChaseFormat, setUseChaseFormat] = useState(false);
  const [showOtherBankInput, setShowOtherBankInput] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [accountData, setAccountData] = useState<{ iban: string; currency: string; account_type: string } | null>(null);
  const [banks, setBanks] = useState<{ id: number; name: string }[]>([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [copiedIban, setCopiedIban] = useState(false);
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountDetails | null>(null);
  const [transferForm, setTransferForm] = useState({
    fromAccountId: 0,
    toAccountId: 0 as number | string,
    amount: '',
    currency: 'RON',
    recipientIBAN: '', // Adăugat pentru transfer prin IBAN
    recipientPhone: '' // Adăugat pentru transfer prin telefon
  });

  // State pentru persoanele trimiși recent
  const [savedRecipients, setSavedRecipients] = useState<any[]>([]);
  const [showSavedRecipients, setShowSavedRecipients] = useState(false);

  // Funcție pentru resetarea formularului de transfer
  const resetTransferForm = () => {
    setTransferForm({
      fromAccountId: selectedAccount?.id || 0,
      toAccountId: 0,
      amount: '',
      currency: 'RON',
      recipientIBAN: '',
      recipientPhone: ''
    });
  };

  // State pentru notificări
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  

  
  const [newAccountForm, setNewAccountForm] = useState({
    currency: 'RON',
    cardId: 0
  });
  
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // Fetch client id și account id din localStorage/email
  useEffect(() => {
    const fetchClientData = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) return setLoading(false);
      const parsedUser = JSON.parse(userData);
      try {
        const clientRes = await axios.post<GetClientResponse>('http://localhost/api/getClientByEmail.php', { email: parsedUser.email });
        if (clientRes.data.success && clientRes.data.client) {
          console.log('Setting clientId:', clientRes.data.client.id);
          setClientId(clientRes.data.client.id);
          
          const accountsRes = await axios.post<GetAccountsResponse>('http://localhost/api/getAccountsByClient.php', { client_id: clientRes.data.client.id });
          if (accountsRes.data.success && accountsRes.data.cards && accountsRes.data.cards.length > 0) {
            const card = accountsRes.data.cards[0];
            setAccountId(card.card_id);
            setAccountData({ 
              iban: card.account_ibans, 
              currency: 'RON', 
              account_type: card.card_type 
            });
          } else {
            setError('Clientul nu are niciun cont bancar. Contactează administratorul.');
          }
        } else {
          setError('Nu s-a găsit clientul.');
        }
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Eroare la conectarea cu serverul!');
      }
    };
    fetchClientData();
  }, []);

  // Fetch băncile disponibile
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axios.get<{ success: boolean; banks: { id: number; name: string }[] }>('http://localhost/api/getBanks.php');
        console.log('Banks response:', res.data);
        if (res.data.success) {
          setBanks(res.data.banks);
          console.log('Banks set:', res.data.banks);
        }
      } catch (err) {
        console.error('Error fetching banks:', err);
      }
    };
    fetchBanks();
  }, []);

  // Funcție pentru pre-completarea automată a formularului
  const prefillForm = () => {
    if (accountData) {
      setForm({
        card_number: '',
        expiration_date: '',
        cvv: '',
        card_type: 'debit',
        bank_id: banks.length > 0 ? banks[0].id.toString() : '',
        status: 'active',
        currency: accountData.currency,
      });
    }
  };

  // Pre-completează formularul când se deschide
  useEffect(() => {
    if (showAddForm && accountData) {
      prefillForm();
    }
  }, [showAddForm, accountData]);

  // Funcție pentru a obține notificările
  const fetchNotifications = async () => {
    if (!clientId) return;
    try {
              const res = await axios.post<any>('http://localhost/api/getTransferNotifications.php', { client_id: clientId });
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };



  // Funcție pentru a procesa notificările (accepta/respinge)
  const processNotification = async (transactionId: number, action: 'accept' | 'reject') => {
    if (!clientId) return;
    try {
              const res = await axios.post<any>('http://localhost/api/processTransferNotification.php', {
        transaction_id: transactionId,
        action: action,
        client_id: clientId
      });
      
      if (res.data.success) {
        alert(res.data.message);
        // Reîmprospătează notificările și datele
        await fetchNotifications();
        if (clientId) {
          const cardsRes = await axios.post<GetCardsResponse>('http://localhost/api/getCardsByClient.php', { client_id: clientId });
          if (cardsRes.data.success) {
            const decryptedCards = cardsRes.data.cards.map(card => ({
              ...card,
              card_number: decryptData(card.card_number),
              expiration_date: decryptData(card.expiration_date),
              cvv: decryptData(card.cvv)
            }));
            setCards(decryptedCards);
          }
        }
      } else {
        alert(res.data.error || 'Eroare la procesarea notificării');
      }
    } catch (err) {
      console.error('Error processing notification:', err);
      alert('Eroare la conectarea cu serverul!');
    }
  };

  // Funcție pentru a obține persoanele trimiși recent
  const getSavedRecipients = useCallback(async () => {
    if (!clientId) return;
    
    try {
      console.log('Obțin persoanele trimiși recent pentru client_id:', clientId);
      const response = await fetch('http://localhost/api/getSavedRecipients.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ client_id: clientId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Răspuns getSavedRecipients:', data);
        if (data.success) {
          setSavedRecipients(data.recipients);
          console.log('Persoane trimiși recent setate:', data.recipients);
        }
      }
    } catch (error) {
      console.error('Eroare la obținerea destinatarilor salvați:', error);
    }
  }, [clientId]);

  // Fetch cards după ce avem clientId
  useEffect(() => {
    if (!clientId) return;
    const fetchCards = async () => {
      setLoading(true);
      try {
        // Adaugă timestamp pentru a preveni cache-ul
        const timestamp = new Date().getTime();
        const res = await axios.post<GetCardsResponse>(
          `http://localhost/api/getCardsByClient.php?t=${timestamp}`, 
          { client_id: clientId }
          // Eliminat headers-ul problematic care cauzează CORS
        );
        
        console.log('API Response:', res.data); // Debug log
        
        if (res.data.success) {
          const decryptedCards = res.data.cards.map(card => ({
            ...card,
            card_number: decryptData(card.card_number),
            expiration_date: decryptData(card.expiration_date),
            cvv: decryptData(card.cvv)
          }));
          
          console.log('Decrypted cards:', decryptedCards); // Debug log
          setCards(decryptedCards);
        } else {
          setError(res.data.error || 'Eroare la încărcare carduri');
        }
      } catch (err) {
        console.error('Error fetching cards:', err);
        setError('Eroare la conectarea cu serverul!');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
    
    // Obține și notificările
    fetchNotifications();
    
    // Obține și persoanele trimiși recent
    console.log('useEffect triggered, calling getSavedRecipients...');
    getSavedRecipients();
  }, [clientId, getSavedRecipients]);

  // Grupare carduri pe bancă
  const grouped = cards.reduce<{ [bank: string]: Card[] }>((acc, card) => {
    console.log('Processing card for grouping:', card); // Debug log
    
    // Verifică dacă cardul are bank_id
    if (!card.bank_id) {
      console.warn('Card missing bank_id:', card);
      // Încearcă să găsești bank_id din accounts
      if (card.accounts && card.accounts.length > 0 && card.accounts[0].bank_id) {
        card.bank_id = card.accounts[0].bank_id;
        console.log('Found bank_id from accounts:', card.bank_id);
      }
    }
    
    const bankKey = `bank_${card.bank_id || 'unknown'}`;
    if (!acc[bankKey]) acc[bankKey] = [];
    acc[bankKey].push(card);
    return acc;
  }, {});

  console.log('Grouped cards:', grouped); // Debug log

  // Formatare automată număr card
  const formatCardNumber = (value: string, isChaseFormat: boolean): string => {
    const cleaned = value.replace(/\D/g, '');
    
    if (isChaseFormat) {
      // Pentru formatul de 32 de cifre, grupează câte 4 cifre
      // Nu trunchia la 32, permite utilizatorului să introducă 32 de cifre
      let formatted = '';
      for (let i = 0; i < cleaned.length; i += 4) {
        if (i > 0) formatted += ' ';
        formatted += cleaned.slice(i, i + 4);
      }
      return formatted;
    } else {
      // Pentru formatul standard de 16 cifre
      const maxLength = Math.min(cleaned.length, 16);
      let formatted = '';
      for (let i = 0; i < maxLength; i += 4) {
        if (i > 0) formatted += ' ';
        formatted += cleaned.slice(i, i + 4);
      }
      return formatted;
    }
  };

  // Formatare automată data expirării (MM/YY)
  const formatExpirationDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      const month = cleaned.slice(0, 2);
      const year = cleaned.slice(2, 4);
      if (month && year) {
        return `${month}/${year}`;
      }
      return month;
    }
    return cleaned;
  };

  // Gestionare selecție bancă
  const handleBankChange = (value: string) => {
    console.log('handleBankChange called with value:', value, 'type:', typeof value);
    
    if (value === 'other') {
      setShowOtherBankInput(true);
      setForm(f => ({ ...f, bank_id: '' }));
    } else {
      setShowOtherBankInput(false);
      setForm(f => ({ ...f, bank_id: value }));
      console.log('Set bank_id to:', value);
    }
  };

  // Validare formular
  const validateForm = () => {
    console.log('Validating form with data:', form);
    
    if (!form.card_number || !form.expiration_date || !form.cvv || !form.bank_id) {
      console.log('Missing required fields:', { 
        card_number: !!form.card_number, 
        expiration_date: !!form.expiration_date, 
        cvv: !!form.cvv, 
        bank_id: !!form.bank_id 
      });
      return 'Completează toate câmpurile!';
    }
    
    const cleanedCardNumber = form.card_number.replace(/\s/g, '');
    
    if (useChaseFormat) {
      if (!/^\d{16,32}$/.test(cleanedCardNumber)) {
        return 'Numărul cardului trebuie să aibă între 16-32 cifre!';
      }
    } else {
      if (!/^\d{16}$/.test(cleanedCardNumber)) {
        return 'Numărul cardului trebuie să aibă exact 16 cifre!';
      }
    }
    
    if (!/^\d{3}$/.test(form.cvv)) {
      return 'CVV-ul trebuie să aibă exact 3 cifre!';
    }
    
    console.log('Checking expiration date format:', form.expiration_date);
    console.log('Regex test result:', /^\d{2}\/\d{2}$/.test(form.expiration_date));
    console.log('Expiration date length:', form.expiration_date.length);
    console.log('Expiration date characters:', form.expiration_date.split('').map(c => `'${c}' (${c.charCodeAt(0)})`));
    
    if (!/^\d{2}\/\d{2}$/.test(form.expiration_date)) {
      console.log('Expiration date format validation failed for:', form.expiration_date);
      return 'Data expirării trebuie să fie în format MM/YY!';
    }
    
    const [month, year] = form.expiration_date.split('/');
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (monthNum < 1 || monthNum > 12) {
      return 'Luna trebuie să fie între 01-12!';
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return 'Data expirării nu poate fi în trecut!';
    }
    
    if (!form.bank_id || form.bank_id === '') {
      return 'Selectează o bancă!';
    }
    
    console.log('Form validation passed successfully');
    return null;
  };

  // Adăugare card nou
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    
    if (!clientId) {
      setAddError('Nu s-a putut identifica clientul!');
      return;
    }
    
    const validationError = validateForm();
    if (validationError) {
      setAddError(validationError);
      return;
    }
    
    try {
      // Convertim MM/YY la ultima zi din lună (YYYY-MM-DD)
      const [month, year] = form.expiration_date.split('/');
      const fullYear = '20' + year;
      const lastDayOfMonth = new Date(parseInt(fullYear), parseInt(month), 0).getDate();
      const formattedExpirationDate = `${fullYear}-${month.padStart(2, '0')}-${lastDayOfMonth}`;

      const encryptedData = {
        client_id: clientId,
        account_id: accountId,
        card_number: encryptData(form.card_number),
        expiration_date: encryptData(formattedExpirationDate), // Trimitem data formatată
        cvv: encryptData(form.cvv),
        card_type: form.card_type,
        bank_id: form.bank_id,
        status: form.status,
        currency: form.currency,
      };
      
      console.log('Sending data:', encryptedData);
      
                           const res = await axios.post<SimpleResponse>('http://localhost/api/addCard.php', encryptedData);
      if (res.data.success) {
        setAddSuccess('Card adăugat cu succes!');
        setShowAddForm(false);
        setForm({ card_number: '', expiration_date: '', cvv: '', card_type: 'debit', bank_id: '', status: 'active', currency: 'RON' });
        setUseChaseFormat(false);
        setShowOtherBankInput(false);
        
                  if (clientId) {
            const accountsRes = await axios.post<GetAccountsResponse>('http://localhost/api/getAccountsByClient.php', { client_id: clientId });
            if (accountsRes.data.success && accountsRes.data.cards && accountsRes.data.cards.length > 0) {
              const card = accountsRes.data.cards[0];
              setAccountId(card.card_id);
              setAccountData({ 
                iban: card.account_ibans, 
                currency: 'RON', 
                account_type: card.card_type 
              });
            }
          
                                           const cardsRes = await axios.post<GetCardsResponse>('http://localhost/api/getCardsByClient.php', { client_id: clientId });
          if (cardsRes.data.success) {
            const decryptedCards = cardsRes.data.cards.map(card => ({
              ...card,
              card_number: decryptData(card.card_number),
              expiration_date: decryptData(card.expiration_date),
              cvv: decryptData(card.cvv)
            }));
            setCards(decryptedCards);
          }
        }
      } else {
        setAddError(res.data.error || 'Eroare la adăugare!');
        if (res.data.debug) {
          console.log('Debug info:', res.data.debug);
        }
      }
    } catch (err) {
      console.error('Error adding card:', err);
      setAddError('Eroare la conectarea cu serverul!');
    }
  };

  // Deschide modalul cu detaliile account-ului
  const handleShowAccountDetails = async (card: Card) => {
    setSelectedCard(card);
    setShowAccountModal(true);
    
    try {
      // Fetch toate accounturile asociate cu cardul
              const res = await axios.post<{ success: boolean; accounts: AccountDetails[] }>('http://localhost/api/getAccountDetails.php', { 
        account_id: card.account_id 
      });
      
      if (res.data.success) {
        setAccountDetails(res.data.accounts[0]); // Pentru compatibilitate, folosim primul account
        // Actualizează cardul cu accounturile
        setCards(cards.map(c => 
          c.id === card.id 
            ? { ...c, accounts: res.data.accounts }
            : c
        ));
      } else {
        setAccountDetails(null);
      }
    } catch (err) {
      console.error('Error fetching account details:', err);
      setAccountDetails(null);
    }
  };

  // Copiază IBAN-ul în clipboard
  const handleCopyIban = async (iban: string) => {
    try {
      await navigator.clipboard.writeText(iban);
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      // Fallback pentru browserele vechi
      const textArea = document.createElement('textarea');
      textArea.value = iban;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    }
  };

  // Editare account
  const handleEditAccount = async (accountId: number) => {
    const newBalance = prompt('Introduceți noul balance pentru account:');
    if (newBalance === null || newBalance === '') return;
    
    const balance = parseFloat(newBalance);
    if (isNaN(balance)) {
      alert('Balance-ul trebuie să fie un număr valid!');
      return;
    }
    
    try {
              const res = await axios.post<SimpleResponse>('http://localhost/api/updateAccountBalance.php', { 
        account_id: accountId, 
        balance: balance 
      });
      
      if (res.data.success) {
        // Actualizează cardurile cu noul balance
        setCards(cards.map(card => {
          // Actualizează balance-ul în card dacă este account-ul principal
          if (card.account_id === accountId) {
            card = { ...card, balance: Number(balance) };
          }
          
          // Actualizează balance-ul în accounturile asociate
          if (card.accounts) {
            card.accounts = card.accounts.map(account => 
              account.id === accountId 
                ? { ...account, balance: Number(balance) }
                : account
            );
          }
          
          return card;
        }));
        
        alert('Balance-ul a fost actualizat cu succes!');
        
        // Reîmprospătează datele pentru a fi siguri
        if (clientId) {
          const cardsRes = await axios.post<GetCardsResponse>('http://localhost/api/getCardsByClient.php', { client_id: clientId });
          if (cardsRes.data.success) {
            const decryptedCards = cardsRes.data.cards.map(card => ({
              ...card,
              card_number: decryptData(card.card_number),
              expiration_date: decryptData(card.expiration_date),
              cvv: decryptData(card.cvv)
            }));
            setCards(decryptedCards);
          }
        }
      } else {
        alert(res.data.error || 'Eroare la actualizare!');
      }
    } catch (err) {
      console.error('Error updating account:', err);
      alert('Eroare la conectarea cu serverul!');
    }
  };

  // Toggle expandare card
  const toggleCardExpansion = (cardId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  // Deschide modalul de transfer
  const handleTransfer = (account: AccountDetails) => {
    setSelectedAccount(account);
    setTransferForm({
      fromAccountId: account.id,
      toAccountId: 0,
      amount: '',
      currency: account.currency,
      recipientIBAN: '', // Adăugat recipientIBAN
      recipientPhone: '' // Adăugat recipientPhone
    });
    setShowTransferModal(true);
  };

  // Execută transferul
  const executeTransfer = async () => {
    if (!transferForm.toAccountId || !transferForm.amount) {
      alert('Completează toate câmpurile!');
      return;
    }

    // Validare pentru persoanele din lista recentă
    if (transferForm.toAccountId === 'last_recipient') {
      console.log('Validating recent recipient transfer...');
      console.log('Current transferForm:', transferForm);
      if (!transferForm.recipientPhone) {
        alert('Selectează o persoană din lista ta!');
        return;
      }
      console.log('Transfer către persoana selectată:', transferForm.recipientPhone);
    }

    // Validare suplimentară pentru formatul sumei
    if (!/^\d+(\.\d{1,2})?$/.test(transferForm.amount)) {
      alert('Suma trebuie să fie un număr valid (ex: 100 sau 100.50)!');
      return;
    }

    const amount = parseFloat(transferForm.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Suma trebuie să fie un număr pozitiv!');
      return;
    }

    // Verifică dacă este transfer prin telefon
    const isPhoneTransfer = transferForm.toAccountId === 'phone_transfer';
    
    // Verifică dacă este transfer prin IBAN
    const isIbanTransfer = transferForm.toAccountId === 'iban_transfer';
    
    // Verifică dacă este transfer către o persoană din lista recentă
    const isLastRecipientTransfer = transferForm.toAccountId === 'last_recipient';
    
    // Verifică dacă este transfer intern (de la tine la tine)
    const isInternalTransfer = typeof transferForm.toAccountId === 'number' && 
                              typeof transferForm.fromAccountId === 'number' && 
                              transferForm.toAccountId === transferForm.fromAccountId;

    try {
      let transferData: any = {
        from_account_id: transferForm.fromAccountId,
        amount: amount,
        client_id: clientId,
        transfer_type: isPhoneTransfer ? 'phone' : (isIbanTransfer ? 'iban' : (isLastRecipientTransfer ? 'phone' : 'internal'))
      };

      if (isPhoneTransfer || isLastRecipientTransfer) {
        // Transfer prin telefon sau către o persoană din lista recentă - folosește numărul de telefon
        transferData.to_phone = transferForm.recipientPhone; // Trimite numărul de telefon
      } else if (isIbanTransfer) {
        // Transfer prin IBAN - folosește IBAN-ul destinatarului
        transferData.to_iban = transferForm.recipientIBAN; // Trimite IBAN-ul destinatarului
      } else {
        // Transfer normal între accounturi
        transferData.to_account_id = transferForm.toAccountId;
      }

              const res = await axios.post<any>('http://localhost/api/transferBetweenAccounts.php', transferData);

      if (res.data.success) {
        let transferType = 'între accounturi';
        if (isPhoneTransfer) transferType = 'prin telefon';
        else if (isIbanTransfer) transferType = 'prin IBAN';
        else if (isLastRecipientTransfer) transferType = 'către persoana selectată';
        else if (isInternalTransfer) transferType = 'intern';
        
        alert(`Transfer ${transferType} realizat cu succes!`);
        setShowTransferModal(false);
        resetTransferForm();
        
        // Reîmprospătează datele
        if (clientId) {
          const cardsRes = await axios.post<GetCardsResponse>('http://localhost/api/getCardsByClient.php', { client_id: clientId });
          if (cardsRes.data.success) {
            const decryptedCards = cardsRes.data.cards.map(card => ({
              ...card,
              card_number: decryptData(card.card_number),
              expiration_date: decryptData(card.expiration_date),
              cvv: decryptData(card.cvv)
            }));
            setCards(decryptedCards);
          }
        }
      } else {
        alert(res.data.error || 'Eroare la transfer!');
      }
    } catch (err) {
      console.error('Error executing transfer:', err);
      alert('Eroare la conectarea cu serverul!');
    }
  };

  // Creează account nou pentru card
  const handleCreateNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId) {
      alert('Nu s-a putut identifica clientul!');
      return;
    }

    if (!newAccountForm.cardId) {
      alert('Selectează un card!');
      return;
    }

    try {
              const res = await axios.post<SimpleResponse>('http://localhost/api/createNewAccountForCard.php', {
        client_id: clientId,
        card_id: newAccountForm.cardId,
        currency: newAccountForm.currency
      });

      if (res.data.success) {
        alert('Account creat cu succes pentru card!');
        setShowNewAccountForm(false);
        setNewAccountForm({ currency: 'RON', cardId: 0 });
        // Reîmprospătează datele
        if (clientId) {
          const cardsRes = await axios.post<GetCardsResponse>('http://localhost/api/getCardsByClient.php', { client_id: clientId });
          if (cardsRes.data.success) {
            const decryptedCards = cardsRes.data.cards.map(card => ({
              ...card,
              card_number: decryptData(card.card_number),
              expiration_date: decryptData(card.expiration_date),
              cvv: decryptData(card.cvv)
            }));
            setCards(decryptedCards);
          }
        }
      } else {
        alert(res.data.error || 'Eroare la crearea account-ului!');
      }
    } catch (err) {
      console.error('Error creating account:', err);
      alert('Eroare la conectarea cu serverul!');
    }
  };

  // Ștergere card
  const handleDelete = async (id: number) => {
    if (!window.confirm('Sigur vrei să ștergi acest card?')) return;
    try {
                           const res = await axios.post<SimpleResponse>('http://localhost/api/deleteCard.php', { id });
      if (res.data.success) {
        setCards(cards.filter(c => c.id !== id));
      } else {
        alert(res.data.error || 'Eroare la ștergere!');
      }
    } catch (err) {
      console.error('Error deleting card:', err);
      alert('Eroare la conectarea cu serverul!');
    }
  };

  // Formatare număr card pentru afișare
  const displayCardNumber = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="header">
          <h2>Carduri</h2>
          <button
            onClick={() => setShowNotifications(true)}
            className={`notification-button ${notifications.length > 0 ? 'has-notifications' : ''}`}
            title={notifications.length > 0 ? `${notifications.length} notificări noi` : 'Nu ai notificări'}
          >
            🔔 Notificări
            {notifications.length > 0 && (
              <span className="notification-count">
                {notifications.length}
              </span>
            )}
          </button>
        </div>
        
        {loading ? (
          <div className="loading-message">Se încarcă...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          Object.keys(grouped).length === 0 ? (
            <div className="no-cards-message">Nu ai niciun card adăugat.</div>
          ) : (
            Object.entries(grouped).map(([bankKey, cards]) => {
              const bankId = parseInt(bankKey.replace('bank_', ''));
              const bankName = banks.find(b => b.id === bankId)?.name || `Banca ${bankId}`;
              
              return (
                <div key={bankKey} className="bank-section">
                  <h3>{bankName}</h3>
                  <table className="card-table">
                    <thead>
                      <tr className="table-header">
                        <th className="details-header">Detalii</th>
                        <th className="card-number-header">Număr card</th>
                        <th className="card-type-header">Tip</th>
                        <th className="expiration-date-header">Expiră</th>
                        <th className="actions-header">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cards.map((card, index) => (
                        <React.Fragment key={card.id}>
                          <tr 
                            className={`card-row ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}
                            onClick={() => toggleCardExpansion(card.id)}
                            title="Click pentru a afișa/ascunde accounturile"
                          >
                            <td className="details-cell">
                              <div className="details-content">
                                <span className="expand-icon">
                                  {expandedCards.has(card.id) ? '🔽' : '▶️'}
                                </span>
                                <span className="account-count">
                                  {card.accounts ? card.accounts.length : 0}
                                </span>
                              </div>
                            </td>
                            <td className="card-number-cell">{displayCardNumber(card.card_number)}</td>
                            <td className="card-type-cell">{card.card_type}</td>
                            <td className="expiration-date-cell">{card.expiration_date}</td>
                            <td className="actions-cell">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(card.id);
                                }} 
                                className="delete-button"
                                title="Șterge cardul"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                          {/* Rânduri pentru accounturile asociate cu acest card */}
                          {expandedCards.has(card.id) && card.accounts && card.accounts.map(account => {
                            // Debug: să vedem exact ce date avem pentru account
                            console.log('Account data:', account);
                            console.log('Account balance:', account.balance, 'Type:', typeof account.balance);
                            
                            return (
                            <tr key={`${card.id}-${account.id}`} className="account-row">
                              <td className="details-cell">
                                <span className="account-icon">📊</span>
                              </td>
                              <td className="account-details-cell">
                                <span className="account-iban">Account: {account.iban}</span>
                              </td>
                              <td className="balance-cell">
                                <span className="balance-value">
                                  Balance: {
                                    (() => {
                                      // Debug info
                                      console.log('Processing balance:', account.balance, 'Type:', typeof account.balance);
                                      
                                      if (account.balance === null || account.balance === undefined) {
                                        return 'N/A';
                                      }
                                      
                                      // Încearcă să convertești la number dacă e string
                                      let balanceValue = account.balance;
                                      if (typeof balanceValue === 'string') {
                                        balanceValue = parseFloat(balanceValue);
                                        console.log('Converted string to number:', balanceValue);
                                      }
                                      
                                      if (typeof balanceValue === 'number' && !isNaN(balanceValue)) {
                                        return `${balanceValue.toFixed(2)} ${account.currency}`;
                                      }
                                      
                                      return 'N/A';
                                    })()
                                  }
                                </span>
                              </td>
                              <td className="bank-name-cell">
                                <span className="bank-name">Bancă: {account.bank_name}</span>
                              </td>
                              <td className="actions-cell">
                                <div className="action-buttons">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShowAccountDetails(card);
                                    }} 
                                    className="view-details-button"
                                    title="Vezi detaliile complete"
                                  >
                                    👁️
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTransfer(account);
                                    }}
                                    className="transfer-button"
                                    title="Transfer"
                                  >
                                    💸
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )})}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })
          )
        )}
        
        <div className="button-container">
          <button onClick={() => {
            setShowAddForm(f => !f);
            // Închide formularul de creare account dacă este deschis
            if (showNewAccountForm) {
              setShowNewAccountForm(false);
            }
          }} className="add-card-button">
            {showAddForm ? 'Renunță' : 'Adaugă card nou'}
          </button>
          <button onClick={() => {
            setShowNewAccountForm(f => !f);
            // Închide formularul de creare card dacă este deschis
            if (showAddForm) {
              setShowAddForm(false);
            }
          }} className="create-new-account-button">
            {showNewAccountForm ? 'Renunță' : 'Creează account nou pentru card'}
          </button>
        </div>
        
        {showAddForm && (
          <form onSubmit={handleAddCard} className="add-card-form">
            <div className="form-group">
              <label>
                Număr card:
                <div className="card-number-container">
                  <input 
                    type="text" 
                    placeholder={useChaseFormat ? "Număr card (16-32 cifre)" : "Număr card (16 cifre)"}
                    value={form.card_number} 
                    onChange={e => {
                      const formatted = formatCardNumber(e.target.value, useChaseFormat);
                      setForm(f => ({ ...f, card_number: formatted }));
                    }} 
                    maxLength={useChaseFormat ? 39 : 19}
                    required 
                    className="card-number-input"
                  />
                  <label className="chase-format-label">
                    <input 
                      type="checkbox" 
                      checked={useChaseFormat} 
                      onChange={e => {
                        setUseChaseFormat(e.target.checked);
                        setForm(f => ({ ...f, card_number: '' }));
                      }}
                    />
                    Alt format
                  </label>
                </div>
              </label>
            </div>
            
            <div className="form-group">
              <label>
                Data expirării:
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  value={form.expiration_date} 
                  onChange={e => setForm(f => ({ ...f, expiration_date: formatExpirationDate(e.target.value) }))} 
                  maxLength={5}
                  required 
                  className="expiration-date-input"
                />
              </label>
            </div>
            
            <div className="form-group">
              <label>
                CVV:
                <input 
                  type="text" 
                  placeholder="3 cifre" 
                  value={form.cvv} 
                  onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))} 
                  maxLength={3}
                  required 
                  className="cvv-input"
                />
              </label>
            </div>
            
            <div className="form-group">
              <label>
                Banca:
                <select value={form.bank_id} onChange={e => handleBankChange(e.target.value)} required className="bank-select">
                  <option value="">Selectează banca</option>
                  {banks.map(bank => (
                    <option key={bank.id} value={bank.id.toString()}>
                      {bank.name}
                    </option>
                  ))}
                  <option value="other">Altă bancă</option>
                </select>
              </label>
            </div>
            
            {showOtherBankInput && (
              <div className="form-group">
                <label>
                  Numele băncii (manual):
                  <input 
                    type="text" 
                    placeholder="Numele băncii (manual)" 
                    value={form.bank_id} 
                    onChange={e => setForm(f => ({ ...f, bank_id: e.target.value }))} 
                    required 
                    className="other-bank-input"
                  />
                </label>
              </div>
            )}
            
            <div className="form-group-row">
              <div className="form-group">
                <label>
                  Tip card:
                  <select value={form.card_type} onChange={e => setForm(f => ({ ...f, card_type: e.target.value }))}>
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                    <option value="virtual">Virtual</option>
                  </select>
                </label>
              </div>
              
              <div className="form-group">
                <label>
                  Monedă:
                  <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                    <option value="RON">RON</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </label>
              </div>
            </div>
            
            {addError && <div className="error-message">{addError}</div>}
            {addSuccess && <div className="success-message">{addSuccess}</div>}
            
            <button type="submit" className="add-card-submit-button">
              Adaugă card
            </button>
          </form>
        )}

        {/* Formular pentru crearea account-ului nou */}
        {showNewAccountForm && (
          <form onSubmit={handleCreateNewAccount} className="create-new-account-form">
            <h3>🏦 Creează Account Nou pentru Card</h3>
            
            <label>
              Selectează cardul:
              <select 
                value={newAccountForm.cardId || ''} 
                onChange={e => setNewAccountForm(f => ({ ...f, cardId: parseInt(e.target.value) }))}
                required
                className="select-card-for-new-account"
              >
                <option value="">Selectează un card</option>
                {cards.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.card_number} - {card.bank_name}
                  </option>
                ))}
              </select>
            </label>
            
            <label>
              Moneda:
              <select 
                value={newAccountForm.currency} 
                onChange={e => setNewAccountForm(f => ({ ...f, currency: e.target.value }))}
                required
                className="select-currency-for-new-account"
              >
                <option value="">Selectează moneda</option>
                <option value="RON">RON</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </label>

            <button type="submit" className="create-new-account-submit-button">
              Creează Account pentru Card
            </button>
          </form>
        )}

        {/* Modal pentru transfer între accounturi */}
        {showTransferModal && (
          <div className="transfer-modal-overlay">
            <div className="transfer-modal-content">
              <div className="modal-header">
                <h3>💸 Transfer între Accounturi</h3>
                <button 
                  onClick={() => {
                    setShowTransferModal(false);
                    resetTransferForm();
                  }}
                  className="close-modal-button"
                >
                  ✕
                </button>
              </div>

              {selectedAccount && (
                <div className="transfer-modal-body">
                  <div className="from-account-details">
                    <h4>Din Account:</h4>
                    <p>IBAN: {selectedAccount.iban}</p>
                    <p>
                      Balance: {(() => {
                        if (selectedAccount.balance === null || selectedAccount.balance === undefined) {
                          return 'N/A';
                        }
                        
                        // Încearcă să convertești la number dacă e string
                        let balanceValue = selectedAccount.balance;
                        if (typeof balanceValue === 'string') {
                          balanceValue = parseFloat(balanceValue);
                        }
                        
                        if (typeof balanceValue === 'number' && !isNaN(balanceValue)) {
                          return `${balanceValue.toFixed(2)} ${selectedAccount.currency}`;
                        }
                        
                        return 'N/A';
                      })()}
                    </p>
                    <p>Bancă: {selectedAccount.bank_name}</p>
                  </div>

                  <div className="transfer-options">
                    <label>
                      Către Card/Account:
                      <select 
                        value={transferForm.toAccountId} 
                        onChange={e => {
                          const value = e.target.value;
                          if (value === 'phone_transfer') {
                            setTransferForm(f => ({ ...f, toAccountId: 'phone_transfer' }));
                          } else if (value === 'iban_transfer') {
                            setTransferForm(f => ({ ...f, toAccountId: 'iban_transfer' }));
                          } else if (value === 'last_recipient') {
                            setTransferForm(f => ({ ...f, toAccountId: 'last_recipient' }));
                          } else {
                            setTransferForm(f => ({ ...f, toAccountId: parseInt(value) }));
                          }
                        }}
                        required
                        className="select-transfer-recipient"
                      >
                        <option value="">Selectează cardul/account-ul destinație</option>
                        {/* Opțiunea pentru transfer prin telefon */}
                        <option value="phone_transfer">📱 Transfer prin telefon</option>
                        {/* Opțiunea pentru transfer prin IBAN */}
                        <option value="iban_transfer">🏦 Transfer prin IBAN</option>
                        {/* Opțiunea pentru persoanele recent */}
                        <option value="last_recipient">👥 Persoane recente ({savedRecipients.length})</option>
                        {/* Accounturile existente */}
                        {cards.map(card => 
                          card.accounts?.map(account => 
                            account.id !== selectedAccount.id ? (
                              <option key={account.id} value={account.id}>
                                💳 {card.card_number} - {account.iban} - {account.bank_name} ({account.currency})
                              </option>
                            ) : null
                          )
                        ).flat().filter(Boolean)}
                      </select>
                    </label>

                    {/* Câmp pentru numărul de telefon (apare doar când e selectat "Transfer prin telefon") */}
                    {transferForm.toAccountId === 'phone_transfer' && (
                      <label>
                        Numărul de telefon al destinatarului:
                        <input 
                          type="tel" 
                          value={transferForm.recipientPhone || ''} 
                          onChange={e => {
                            // Permite doar + și numere
                            let value = e.target.value.replace(/[^\d+]/g, '');
                            // Verifică că + este doar la început
                            if (value.includes('+') && !value.startsWith('+')) {
                              value = value.replace(/\+/g, '');
                            }
                            // Limitează la 20 caractere
                            value = value.slice(0, 20);
                            setTransferForm(f => ({ ...f, recipientPhone: value }));
                          }}
                          placeholder="Introduceți numărul de telefon (ex: +40722123456 sau 0722123456)"
                          required
                          maxLength={20}
                          inputMode="tel"
                          className="phone-number-input"
                        />
                        <small className="phone-number-hint">
                          Numărul de telefon este identificatorul unic al destinatarului
                        </small>
                      </label>
                    )}

                    {/* Câmp pentru IBAN-ul destinatarului (apare doar când e selectat "Transfer prin IBAN") */}
                    {transferForm.toAccountId === 'iban_transfer' && (
                      <label>
                        IBAN-ul destinatarului:
                        <input 
                          type="text" 
                          value={transferForm.recipientIBAN || ''} 
                          onChange={e => setTransferForm(f => ({ ...f, recipientIBAN: e.target.value }))}
                          placeholder="Introduceți IBAN-ul destinatarului (ex: RO49AAAA1B31007593840000)"
                          required
                          className="iban-input"
                        />
                      </label>
                    )}

                    {/* Câmp pentru persoanele trimiși recent (apare doar când e selectat "Persoane trimiși recent") */}
                    {transferForm.toAccountId === 'last_recipient' && (
                      <label>
                        Persoane trimiși recent:
                        <select 
                          value={transferForm.recipientPhone || ''} 
                          onChange={e => {
                          const selectedPhone = e.target.value;
                          setTransferForm(f => ({ ...f, recipientPhone: selectedPhone }));
                          console.log('Selected recipient phone:', selectedPhone);
                          console.log('Updated transferForm:', { ...transferForm, recipientPhone: selectedPhone });
                        }}
                          required
                          className="last-recipient-select"
                        >
                          <option value="">Selectează destinatarul</option>
                          {savedRecipients.map(recipient => (
                            <option key={recipient.id} value={recipient.phone}>
                              👤 {recipient.name} - {recipient.phone} - {recipient.bank} ({recipient.currency})
                            </option>
                          ))}
                        </select>
                        <small className="last-recipient-hint">
                          Selectează o persoană din lista ta de destinatari recenti
                        </small>
                      </label>
                    )}

                    <label>
                      Suma:
                      <input 
                        type="text" 
                        value={transferForm.amount} 
                        onChange={e => {
                          // Permite doar numere și punct
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          // Permite doar un punct
                          const parts = value.split('.');
                          if (parts.length <= 2) {
                            setTransferForm(f => ({ ...f, amount: value }));
                          }
                        }}
                        onKeyPress={(e) => {
                          // Permite doar numere, punct și backspace
                          const char = String.fromCharCode(e.which);
                          if (!/[0-9.]/.test(char)) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="Introduceți suma (ex: 100.50)"
                        required
                        className="transfer-amount-input"
                      />
                    </label>

                  </div>

                  <div className="modal-footer">
                    <button
                      onClick={executeTransfer}
                      className="execute-transfer-button"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                    >
                      Execută Transfer
                    </button>
                    <button
                      onClick={() => {
                        setShowTransferModal(false);
                        resetTransferForm();
                      }}
                      className="cancel-transfer-button"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                    >
                      Anulează
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal pentru detaliile account-ului */}
        {showAccountModal && (
          <div className="account-details-modal-overlay">
            <div className="account-details-modal-content">
              <div className="modal-header">
                <h3>💳 Detaliile Account-ului</h3>
                <button 
                  onClick={() => setShowAccountModal(false)}
                  className="close-modal-button"
                >
                  ✕
                </button>
              </div>

              {selectedCard && selectedCard.accounts ? (
                <div className="account-details-body">
                  <h4>📊 {selectedCard.accounts.length} Account-uri pentru cardul {selectedCard.card_number}</h4>
                  
                  {selectedCard.accounts.map((account, index) => (
                    <div key={account.id} className="account-details-card">
                      <h5>Account #{index + 1}</h5>
                      
                      <div className="account-detail-row">
                        <span className="detail-label">IBAN:</span>
                        <div className="iban-and-copy-container">
                          <span className="iban-value">{account.iban}</span>
                          <button
                            onClick={() => handleCopyIban(account.iban)}
                            className={`copy-iban-button ${copiedIban ? 'copied' : ''}`}
                            title={copiedIban ? 'IBAN copiat!' : 'Copiază IBAN-ul'}
                          >
                            {copiedIban ? '✓' : '📋'}
                          </button>
                        </div>
                      </div>

                      <div className="account-detail-row">
                        <span className="detail-label">Balance:</span>
                        <span className="balance-value">
                          {(() => {
                            if (account.balance === null || account.balance === undefined) {
                              return 'N/A';
                            }
                            
                            // Încearcă să convertești la number dacă e string
                            let balanceValue = account.balance;
                            if (typeof balanceValue === 'string') {
                              balanceValue = parseFloat(balanceValue);
                            }
                            
                            if (typeof balanceValue === 'number' && !isNaN(balanceValue)) {
                              return `${balanceValue.toFixed(2)} ${account.currency}`;
                            }
                            
                            return 'N/A';
                          })()}
                        </span>
                      </div>

                      <div className="account-detail-row">
                        <span className="detail-label">Bancă:</span>
                        <span className="bank-name-value">{account.bank_name}</span>
                      </div>

                      <div className="account-detail-row">
                        <span className="detail-label">Data creării:</span>
                        <span className="created-at-value">{new Date(account.created_at).toLocaleDateString('ro-RO')}</span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="card-number-detail-row">
                    <span className="detail-label">Numărul cardului:</span>
                    <span className="card-number-value">{selectedCard.card_number}</span>
                  </div>
                </div>
              ) : (
                <div className="loading-message">Se încarcă detaliile account-urilor...</div>
              )}

              <div className="modal-footer">
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="close-modal-button"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                >
                  Închide
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal pentru notificări */}
        {showNotifications && (
          <div className="notifications-modal-overlay">
            <div className="notifications-modal-content">
              <div className="modal-header">
                <h3>🔔 Notificări Transfer</h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="close-modal-button"
                >
                  ✕
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="no-notifications-message">
                  <div className="no-notifications-icon">🔕</div>
                  <h4>Nu ai notificări</h4>
                  <p>Toate transferurile au fost procesate.</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="notification-item">
                      <div className="notification-header">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <div className="notification-sender-info">
                          <strong>De la:</strong> {notification.sender_name} ({notification.sender_bank})<br />
                          <strong>IBAN:</strong> {notification.sender_iban}<br />
                          <strong>Data:</strong> {notification.date}
                        </div>
                      </div>
                      <div className="notification-amount">
                        <span>{notification.amount} {notification.currency}</span>
                      </div>
                      <div className="notification-actions">
                        <button
                          onClick={() => processNotification(notification.id, 'accept')}
                          className="accept-notification-button"
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                        >
                          ✅ Acceptă Transfer
                        </button>
                        <button
                          onClick={() => processNotification(notification.id, 'reject')}
                          className="reject-notification-button"
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                        >
                          ❌ Respinge Transfer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CarduriPage;
