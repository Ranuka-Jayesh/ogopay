import { Transaction, DataState } from '../types';

const STORAGE_KEY = 'loanManagementData';

export const getStoredData = (): DataState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  // Return default data with admin user
  return {
    users: [
      {
        id: 'admin-1',
        email: 'admin@example.com',
        name: 'Admin',
        role: 'admin',
        password: 'admin123'
      }
    ],
    transactions: [],
    friends: []
  };
};

export const saveData = (data: DataState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const calculateFriendBalances = (transactions: Transaction[]): Record<string, { totalBorrowed: number; totalRepaid: number; remainingBalance: number }> => {
  const balances: Record<string, { totalBorrowed: number; totalRepaid: number; remainingBalance: number }> = {};
  
  transactions.forEach(transaction => {
    if (!balances[transaction.friendId]) {
      balances[transaction.friendId] = { totalBorrowed: 0, totalRepaid: 0, remainingBalance: 0 };
    }
    
    if (transaction.type === 'loan') {
      balances[transaction.friendId].totalBorrowed += transaction.amount;
    } else {
      balances[transaction.friendId].totalRepaid += transaction.amount;
    }
    
    balances[transaction.friendId].remainingBalance = 
      balances[transaction.friendId].totalBorrowed - balances[transaction.friendId].totalRepaid;
  });
  
  return balances;
};