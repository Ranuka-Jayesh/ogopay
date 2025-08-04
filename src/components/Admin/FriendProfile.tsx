import React from 'react';
import { Friend, Transaction } from '../../types';
import { useData } from '../../contexts/DataContext';
import { TransactionSlip } from './TransactionSlip';
import { ArrowLeft, User, Mail, DollarSign, TrendingUp, TrendingDown, Clock, ArrowUpCircle, ArrowDownCircle, Link, Copy, Share2, Edit, Trash2 } from 'lucide-react';
import { getFullTrackingUrl } from '../../utils/trackingUrl';
import { useModal } from './AdminDashboard';

interface FriendProfileProps {
  friend: Friend;
  onBack: () => void;
}

export const FriendProfile: React.FC<FriendProfileProps> = ({ friend, onBack }) => {
  const { getFriendTransactions } = useData();
  const { setEditingFriend, setDeletingFriend } = useModal();
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const [copySuccess, setCopySuccess] = React.useState(false);
  const transactions = getFriendTransactions(friend.id);

  const stats = [
    {
      title: 'Total Borrowed',
      value: `$${friend.totalBorrowed.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Repaid',
      value: `$${friend.totalRepaid.toLocaleString()}`,
      icon: TrendingDown,
      color: 'bg-green-500'
    },
    {
      title: 'Remaining Balance',
      value: `$${friend.remainingBalance.toLocaleString()}`,
      icon: DollarSign,
      color: friend.remainingBalance > 0 ? 'bg-red-500' : 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Overview</span>
        </button>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingFriend(friend)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            title="Edit friend"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Edit</span>
          </button>
          <button
            onClick={() => setDeletingFriend(friend)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete friend"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Delete</span>
          </button>
        </div>
      </div>

      {/* Friend Info Card */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-secondary-700">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full">
            <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{friend.name}</h2>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              <span>{friend.email}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking URL Section */}
      {friend.trackingUrl && (
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-secondary-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Link className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tracking URL</h3>
            </div>
            <span className="text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">
              Public Access
            </span>
          </div>
          
          <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Share this URL with {friend.name}</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                  {getFullTrackingUrl(friend.trackingUrl)}
                </p>
                {copySuccess && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ✓ URL copied to clipboard!
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={async () => {
                    if (!friend.trackingUrl) return;
                    try {
                      await navigator.clipboard.writeText(getFullTrackingUrl(friend.trackingUrl));
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    } catch (err) {
                      console.error('Failed to copy URL:', err);
                    }
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  title="Copy tracking URL"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (!friend.trackingUrl) return;
                    if (navigator.share) {
                      navigator.share({
                        title: `${friend.name}'s Transaction History`,
                        text: `View ${friend.name}'s loan and repayment history`,
                        url: getFullTrackingUrl(friend.trackingUrl)
                      });
                    } else {
                      // Fallback to copying to clipboard
                      navigator.clipboard.writeText(getFullTrackingUrl(friend.trackingUrl));
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  title="Share tracking URL"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>• This URL allows {friend.name} to view their transaction history without logging in</p>
            <p>• Share via WhatsApp, email, or any messaging platform</p>
            <p>• The page shows all loans, repayments, and current balance</p>
          </div>
        </div>
      )}

      {/* Balance Status */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-secondary-700">
        <div className="text-center">
          {friend.remainingBalance === 0 ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-green-100 p-4 rounded-full">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800">All Settled Up!</h3>
              <p className="text-green-600">{friend.name} has no outstanding balance.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-red-100 p-4 rounded-full">
                <Clock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-800">Outstanding Balance</h3>
              <p className="text-red-600">
                {friend.name} owes <span className="font-bold">${friend.remainingBalance.toLocaleString()}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-200 dark:border-secondary-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-secondary-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} total
          </p>
        </div>

        <div className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No transactions recorded yet.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Use the "Record Transaction" tab to add loans or repayments.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="p-4 bg-gray-50 dark:bg-secondary-700 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-lg ${
                        transaction.type === 'loan' ? 'bg-primary-100 dark:bg-primary-900/20' : 'bg-emerald-100 dark:bg-emerald-900/20'
                      }`}>
                        {transaction.type === 'loan' ? (
                          <ArrowUpCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        ) : (
                          <ArrowDownCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                    </div>
                      <div className="flex-grow">
                      <div className="flex items-center space-x-3">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {transaction.type === 'loan' ? 'Loan Given' : 'Payment Received'}
                        </p>
                        <span className="text-xs bg-gray-200 dark:bg-secondary-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {transaction.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 bg-white dark:bg-secondary-800 p-2 rounded border-l-4 border-gray-300 dark:border-secondary-600">
                          <span className="font-medium">Note:</span> {transaction.description}
                        </p>
                      )}
                    </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                    <p className={`text-xl font-bold ${
                      transaction.type === 'loan' ? 'text-primary-600 dark:text-primary-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {transaction.type === 'loan' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {transaction.type === 'loan' ? 'Lent' : 'Repaid'}
                    </p>
                  </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="w-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 py-2 px-4 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-700 transition-all font-medium text-sm"
                    >
                      Generate Slip & Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Card */}
      {transactions.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
          <h4 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4">Transaction Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {transactions.filter(t => t.type === 'loan').length}
              </p>
              <p className="text-sm text-primary-700 dark:text-primary-300">Loans</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {transactions.filter(t => t.type === 'repayment').length}
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">Repayments</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                ${Math.max(...transactions.map(t => t.amount)).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Largest Amount</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                ${Math.min(...transactions.map(t => t.amount)).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Smallest Amount</p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Slip Modal */}
      {selectedTransaction && (
        <TransactionSlip
          transaction={selectedTransaction}
          friend={friend}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};