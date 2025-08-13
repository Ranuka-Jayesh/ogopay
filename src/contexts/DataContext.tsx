import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Friend as DatabaseFriend, Transaction as DatabaseTransaction } from '../lib/supabase';

// Local types for the app
interface Friend {
  id: string;
  name: string;
  email: string;
  trackingUrl?: string;
  tracking_code?: string;
  totalBorrowed: number;
  totalRepaid: number;
  remainingBalance: number;
}

interface Transaction {
  id: string;
  friendId: string;
  amount: number;
  type: 'loan' | 'repayment';
  date: string;
  description?: string;
}

interface DataContextType {
  friends: Friend[];
  transactions: Transaction[];
  addFriend: (name: string, whatsappNumber: string) => Promise<boolean>;
  editFriend: (id: string, name: string, whatsappNumber: string) => Promise<boolean>;
  deleteFriend: (id: string) => Promise<void>;
  addTransaction: (friendId: string, amount: number, type: 'loan' | 'repayment', description?: string) => Promise<void>;
  getFriendTransactions: (friendId: string) => Transaction[];
  updateTrackingCode: (friendId: string, newCode: string) => Promise<boolean>;
  refreshData: () => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

interface DataState {
  friends: DatabaseFriend[];
  transactions: DatabaseTransaction[];
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DataState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch friends for this admin
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('*')
        .eq('admin_id', user.id);

      if (friendsError) {
        console.error('Error fetching friends:', friendsError);
        setIsLoading(false);
        return;
      }

      // Fetch transactions for this admin
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('admin_id', user.id);

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        setIsLoading(false);
        return;
      }

      setData({
        friends: friendsData || [],
        transactions: transactionsData || []
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const refreshData = () => {
    fetchData();
  };

  const friends: Friend[] = React.useMemo(() => {
    if (!data) return [];
    const balances = calculateFriendBalances(data.transactions);
    
    return data.friends.map(friend => ({
      id: friend.id.toString(),
      name: friend.full_name,
      email: friend.whatsapp_number,
      trackingUrl: friend.tracking_url,
      tracking_code: friend.tracking_code,
      totalBorrowed: balances[friend.id.toString()]?.totalBorrowed || 0,
      totalRepaid: balances[friend.id.toString()]?.totalRepaid || 0,
      remainingBalance: balances[friend.id.toString()]?.remainingBalance || 0
    }));
  }, [data?.friends, data?.transactions]);

  const transactions: Transaction[] = React.useMemo(() => {
    if (!data) return [];
    return data.transactions.map(t => ({
      id: t.id.toString(),
      friendId: t.friend_id.toString(),
      amount: t.amount,
      type: t.type,
      date: t.transaction_date,
      description: t.description
    }));
  }, [data?.transactions]);

  const addFriend = async (name: string, whatsappNumber: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      // Check if friend already exists
      const { data: existingFriend } = await supabase
        .from('friends')
        .select('*')
        .eq('whatsapp_number', whatsappNumber)
        .eq('admin_id', user.id)
        .single();

      if (existingFriend) {
        return false;
      }

      // Add friend to database
      const { error } = await supabase
        .from('friends')
        .insert({
          full_name: name,
          whatsapp_number: whatsappNumber,
          admin_id: user.id,
          is_registered: false
        });

      if (error) {
        console.error('Error adding friend:', error);
        return false;
      }

      refreshData();
      return true;
    } catch (error) {
      console.error('Error adding friend:', error);
      return false;
    }
  };

  const editFriend = async (id: string, name: string, whatsappNumber: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      // Check if whatsapp number already exists for another friend
      const { data: existingFriend } = await supabase
        .from('friends')
        .select('*')
        .eq('whatsapp_number', whatsappNumber)
        .eq('admin_id', user.id)
        .neq('id', id)
        .single();

      if (existingFriend) {
        return false;
      }

      const { error } = await supabase
        .from('friends')
        .update({ 
          full_name: name, 
          whatsapp_number: whatsappNumber 
        })
        .eq('id', id)
        .eq('admin_id', user.id);

      if (error) {
        console.error('Error editing friend:', error);
        return false;
      }

      refreshData();
      return true;
    } catch (error) {
      console.error('Error editing friend:', error);
      return false;
    }
  };

  const deleteFriend = async (id: string) => {
    if (!user) {
      return;
    }

    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', id)
        .eq('admin_id', user.id);

      if (error) {
        console.error('Error deleting friend:', error);
        return;
      }

      refreshData();
    } catch (error) {
      console.error('Error deleting friend:', error);
    }
  };

  const addTransaction = async (friendId: string, amount: number, type: 'loan' | 'repayment', description?: string) => {
    if (!user) {
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          admin_id: user.id,
          friend_id: parseInt(friendId),
          type,
          amount,
          description
        });

      if (error) {
        console.error('Error adding transaction:', error);
        return;
      }

      refreshData();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const getFriendTransactions = (friendId: string): Transaction[] => {
    if (!data) return [];
    return data.transactions
      .filter(t => t.friend_id.toString() === friendId)
      .map(t => ({
        id: t.id.toString(),
        friendId: t.friend_id.toString(),
        amount: t.amount,
        type: t.type,
        date: t.transaction_date,
        description: t.description
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const updateTrackingCode = async (friendId: string, newCode: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('friends')
        .update({ tracking_code: newCode })
        .eq('id', parseInt(friendId))
        .eq('admin_id', user.id);

      if (error) {
        console.error('Error updating tracking code:', error);
        return false;
      }

      refreshData();
      return true;
    } catch (error) {
      console.error('Error updating tracking code:', error);
      return false;
    }
  };

  return (
    <DataContext.Provider value={{
      friends,
      transactions,
      addFriend,
      editFriend,
      deleteFriend,
      addTransaction,
      getFriendTransactions,
      updateTrackingCode,
      refreshData,
      isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Helper function to calculate balances
const calculateFriendBalances = (transactions: DatabaseTransaction[]) => {
  const balances: { [key: string]: { totalBorrowed: number; totalRepaid: number; remainingBalance: number } } = {};

  transactions.forEach(transaction => {
    const friendId = transaction.friend_id.toString();
    const amount = transaction.amount;
    const type = transaction.type;

    if (!balances[friendId]) {
      balances[friendId] = { totalBorrowed: 0, totalRepaid: 0, remainingBalance: 0 };
    }

    if (type === 'loan') {
      balances[friendId].totalBorrowed += amount;
    } else if (type === 'repayment') {
      balances[friendId].totalRepaid += amount;
    }
    balances[friendId].remainingBalance = balances[friendId].totalBorrowed - balances[friendId].totalRepaid;
  });

  return balances;
};