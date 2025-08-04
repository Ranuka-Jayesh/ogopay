export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'friend';
  password: string;
}

export interface Transaction {
  id: string;
  friendId: string;
  amount: number;
  type: 'loan' | 'repayment';
  date: string;
  description?: string;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  trackingUrl?: string;
  totalBorrowed: number;
  totalRepaid: number;
  remainingBalance: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface DataState {
  users: User[];
  transactions: Transaction[];
  friends: Friend[];
}