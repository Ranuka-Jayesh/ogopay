import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { ArrowUpCircle, ArrowDownCircle, Calendar, DollarSign, User, Phone, X } from 'lucide-react';

interface TrackingData {
  friend: {
    id: number;
    full_name: string;
    whatsapp_number: string;
    created_at: string;
  };
  transactions: Array<{
    id: number;
    type: 'loan' | 'repayment';
    amount: number;
    description?: string;
    transaction_date: string;
  }>;
  summary: {
    totalBorrowed: number;
    totalRepaid: number;
    remainingBalance: number;
  };
}

interface TrackingPageProps {
  trackingUrl: string;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ trackingUrl }) => {
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Find friend by tracking URL
        const { data: friendData, error: friendError } = await supabase
          .from('friends')
          .select('*')
          .eq('tracking_url', trackingUrl)
          .single();

        if (friendError || !friendData) {
          setError('Tracking URL not found or invalid.');
          return;
        }

        // Fetch transactions for this friend
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('friend_id', friendData.id)
          .order('transaction_date', { ascending: false });

        if (transactionsError) {
          setError('Failed to load transaction history.');
          return;
        }

        // Calculate summary
        const summary = {
          totalBorrowed: 0,
          totalRepaid: 0,
          remainingBalance: 0
        };

        transactionsData?.forEach((transaction: any) => {
          if (transaction.type === 'loan') {
            summary.totalBorrowed += transaction.amount;
          } else if (transaction.type === 'repayment') {
            summary.totalRepaid += transaction.amount;
          }
        });

        summary.remainingBalance = summary.totalBorrowed - summary.totalRepaid;

        setData({
          friend: friendData,
          transactions: transactionsData || [],
          summary
        });
      } catch (err) {
        setError('An error occurred while loading the data.');
        console.error('Tracking page error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [trackingUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-100 dark:from-secondary-900 dark:to-secondary-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading transaction history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-100 dark:from-secondary-900 dark:to-secondary-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-100 dark:from-secondary-900 dark:to-secondary-800">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Transaction History
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View your loan and repayment history
              </p>
            </div>

            {/* Friend Info */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {data.friend.full_name}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>{data.friend.whatsapp_number}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Borrowed</p>
                    <p className="text-2xl font-bold">${data.summary.totalBorrowed.toLocaleString()}</p>
                  </div>
                  <ArrowUpCircle className="h-8 w-8 text-blue-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Repaid</p>
                    <p className="text-2xl font-bold">${data.summary.totalRepaid.toLocaleString()}</p>
                  </div>
                  <ArrowDownCircle className="h-8 w-8 text-green-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`rounded-xl p-6 text-white ${
                  data.summary.remainingBalance > 0
                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Remaining Balance</p>
                    <p className="text-2xl font-bold">${data.summary.remainingBalance.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 opacity-80" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Transaction History
            </h3>

            {data.transactions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No transactions found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      transaction.type === 'loan'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === 'loan'
                            ? 'bg-red-100 dark:bg-red-900/40'
                            : 'bg-green-100 dark:bg-green-900/40'
                        }`}
                      >
                        {transaction.type === 'loan' ? (
                          <ArrowUpCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.type === 'loan' ? 'Loan' : 'Repayment'}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {transaction.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-lg ${
                          transaction.type === 'loan'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {transaction.type === 'loan' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 