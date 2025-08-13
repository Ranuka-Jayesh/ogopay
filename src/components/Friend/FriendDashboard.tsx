import React from 'react';
import { Layout } from '../Shared/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DollarSign, TrendingUp, TrendingDown, Clock, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export const FriendDashboard: React.FC = () => {
  const { user } = useAuth();
  const { friends, getFriendTransactions } = useData();

  const currentFriend = friends.find(f => f.id === user?.id);
  const transactions = getFriendTransactions(user?.id || '');

  const stats = [
    {
      title: 'Total Borrowed',
      value: `$${currentFriend?.totalBorrowed.toLocaleString() || '0'}`,
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Repaid',
      value: `$${currentFriend?.totalRepaid.toLocaleString() || '0'}`,
      icon: TrendingDown,
      color: 'bg-green-500'
    },
    {
      title: 'Remaining Balance',
      value: `$${currentFriend?.remainingBalance.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: currentFriend?.remainingBalance && currentFriend.remainingBalance > 0 ? 'bg-red-500' : 'bg-green-500'
    }
  ];

  return (
    <Layout 
      title={`Welcome, ${user?.name}`}
      onLogoClick={() => {
        // For friend dashboard, just navigate to home (which is the friend dashboard)
        // This ensures the logo always takes you to the main dashboard view
      }}
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-secondary-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Balance Status */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-secondary-700">
          <div className="text-center">
            {!currentFriend || currentFriend.remainingBalance === 0 ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-green-100 p-4 rounded-full">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800">All Settled Up!</h3>
                <p className="text-green-600">You have no outstanding balance.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-red-100 p-4 rounded-full">
                  <Clock className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-800">Outstanding Balance</h3>
                <p className="text-red-600">
                  You owe <span className="font-bold">${currentFriend.remainingBalance.toLocaleString()}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-200 dark:border-secondary-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-secondary-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
          </div>

          <div className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No transactions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-secondary-700 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-600 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'loan' ? 'bg-primary-100 dark:bg-primary-900/20' : 'bg-emerald-100 dark:bg-emerald-900/20'
                      }`}>
                        {transaction.type === 'loan' ? (
                          <ArrowUpCircle className={`h-5 w-5 ${
                            transaction.type === 'loan' ? 'text-primary-600 dark:text-primary-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`} />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.type === 'loan' ? 'Loan Received' : 'Payment Made'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{transaction.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'loan' ? 'text-primary-600 dark:text-primary-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {transaction.type === 'loan' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};