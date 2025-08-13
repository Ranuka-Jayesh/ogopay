import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowUpCircle, ArrowDownCircle, Check, X } from 'lucide-react';

interface RecordTransactionProps {
  onSuccess?: () => void;
}

export const RecordTransaction: React.FC<RecordTransactionProps> = ({ onSuccess }) => {
  const [friendId, setFriendId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'loan' | 'repayment'>('loan');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { friends, refreshData } = useData();
  const { user } = useAuth();

  // Currency formatting function
  const formatCurrency = (amount: number) => {
    const currency = user?.preferred_currency || 'LKR';
    const currencySymbols: { [key: string]: string } = {
      'LKR': 'Rs.',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'AUD': 'A$',
      'CAD': 'C$',
      'JPY': '¥'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toLocaleString()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('You must be logged in to record transactions.');
      return;
    }

    if (!friendId) {
      setError('Please select a friend');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    try {
      // Insert transaction into database
      const { error } = await supabase
        .from('transactions')
        .insert([
          {
            admin_id: user.id,
            friend_id: parseInt(friendId),
            type,
            amount: amountNum,
            description: description.trim() || null
          }
        ]);

      if (error) {
        setError('Failed to record transaction. Please try again.');
        console.error('Database error:', error);
      } else {
        setSuccess(`${type === 'loan' ? 'Loan' : 'Repayment'} recorded successfully!`);
        setFriendId('');
        setAmount('');
        setDescription('');
        
        // Auto-close modal after a short delay
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Record transaction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          {type === 'loan' ? (
            <ArrowUpCircle className="h-8 w-8 text-primary-600" />
          ) : (
            <ArrowDownCircle className="h-8 w-8 text-emerald-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Record Transaction</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Add a new loan or repayment</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('loan')}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all ${
                type === 'loan'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'border-gray-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-600'
              }`}
            >
              <ArrowUpCircle className="h-5 w-5" />
              <span>Loan</span>
            </button>
            <button
              type="button"
              onClick={() => setType('repayment')}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all ${
                type === 'repayment'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'border-gray-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-600'
              }`}
            >
              <ArrowDownCircle className="h-5 w-5" />
              <span>Repayment</span>
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="friend" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Friend
          </label>
          <select
            id="friend"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">Choose a friend...</option>
            {friends.map((friend) => (
              <option key={friend.id} value={friend.id}>
                {friend.name} ({friend.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount ({user?.preferred_currency || 'LKR'})
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-gray-900 dark:text-white"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-gray-900 dark:text-white"
            placeholder="Add a note about this transaction..."
            rows={3}
          />
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm">
            <X className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg text-sm">
            <Check className="h-4 w-4" />
            <span>{success}</span>
            <div className="text-xs text-green-600 dark:text-green-300 mt-1">
              Modal will close automatically...
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || friends.length === 0}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Recording...' : `Record ${type === 'loan' ? 'Loan' : 'Repayment'}`}
        </button>

        {friends.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Add friends first to record transactions
          </p>
        )}
      </form>
    </div>
  );
};