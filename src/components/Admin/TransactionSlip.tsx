import React from 'react';
import { Transaction, Friend } from '../../types';
import { DollarSign, Calendar, FileText, User, Hash } from 'lucide-react';

interface TransactionSlipProps {
  transaction: Transaction;
  friend: Friend;
  onClose: () => void;
}

export const TransactionSlip: React.FC<TransactionSlipProps> = ({ transaction, friend, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const slipText = `
LOAN MANAGEMENT SLIP
====================

Transaction ID: ${transaction.id}
Date: ${new Date(transaction.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}

Friend: ${friend.name}
Email: ${friend.email}

Transaction Type: ${transaction.type === 'loan' ? 'LOAN GIVEN' : 'PAYMENT RECEIVED'}
Amount: $${transaction.amount.toLocaleString()}

${transaction.description ? `Description: ${transaction.description}` : ''}

Current Balance: $${friend.remainingBalance.toLocaleString()}

Generated on: ${new Date().toLocaleDateString()}
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Transaction Slip - ${friend.name}`,
          text: slipText,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(slipText);
        alert('Transaction slip copied to clipboard!');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(slipText);
        alert('Transaction slip copied to clipboard!');
      } catch (error) {
        alert('Unable to copy to clipboard. Please copy manually.');
      }
    }
  };

  const handleDownload = () => {
    const slipContent = `
LOAN MANAGEMENT SLIP
====================

Transaction ID: ${transaction.id}
Date: ${new Date(transaction.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}

Friend: ${friend.name}
Email: ${friend.email}

Transaction Type: ${transaction.type === 'loan' ? 'LOAN GIVEN' : 'PAYMENT RECEIVED'}
Amount: $${transaction.amount.toLocaleString()}

${transaction.description ? `Description: ${transaction.description}` : ''}

Current Balance: $${friend.remainingBalance.toLocaleString()}

Generated on: ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([slipContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction-slip-${friend.name.replace(/\s+/g, '-').toLowerCase()}-${transaction.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Slip Content */}
        <div className="p-8 print:p-4" id="transaction-slip">
          {/* Header */}
          <div className="text-center mb-8 print:mb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full">
                <DollarSign className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white print:text-xl">TRANSACTION SLIP</h2>
            <div className="w-16 h-1 bg-primary-600 mx-auto mt-2"></div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-6 print:space-y-3">
            {/* Transaction ID */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-secondary-700 rounded-lg print:bg-transparent print:p-1">
              <Hash className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transaction ID</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">{transaction.id}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-secondary-700 rounded-lg print:bg-transparent print:p-1">
              <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date & Time</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Friend Details */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-secondary-700 rounded-lg print:bg-transparent print:p-1">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Friend</p>
                <p className="font-semibold text-gray-900 dark:text-white">{friend.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{friend.email}</p>
              </div>
            </div>

            {/* Transaction Type & Amount */}
            <div className="border-2 border-dashed border-gray-300 dark:border-secondary-600 p-4 rounded-lg print:border-solid">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Transaction Type</p>
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  transaction.type === 'loan' 
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200' 
                    : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200'
                }`}>
                  <span>{transaction.type === 'loan' ? 'LOAN GIVEN' : 'PAYMENT RECEIVED'}</span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</p>
                  <p className={`text-3xl font-bold print:text-2xl ${
                    transaction.type === 'loan' ? 'text-primary-600 dark:text-primary-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    ${transaction.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {transaction.description && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-secondary-700 rounded-lg print:bg-transparent print:p-1">
                <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</p>
                  <p className="text-gray-900 dark:text-white">{transaction.description}</p>
                </div>
              </div>
            )}

            {/* Current Balance */}
            <div className="border-t border-gray-200 dark:border-secondary-700 pt-4 print:pt-2">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Balance</p>
                <p className={`text-2xl font-bold print:text-xl ${
                  friend.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ${friend.remainingBalance.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {friend.remainingBalance > 0 ? 'Amount Owed' : 'Fully Settled'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-secondary-700 pt-4 print:pt-2">
              <p>Generated on {new Date().toLocaleDateString()}</p>
              <p className="mt-1">Loan Management System</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 pb-8 print:hidden">
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleShare}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-800 transition-all font-medium"
            >
              Share Slip
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownload}
                className="bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-800 transition-all font-medium"
              >
                Download
              </button>
              <button
                onClick={handlePrint}
                className="bg-gray-600 dark:bg-secondary-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 dark:hover:bg-secondary-500 focus:ring-2 focus:ring-gray-500 dark:focus:ring-secondary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-800 transition-all font-medium"
              >
                Print
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 dark:bg-secondary-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-secondary-600 focus:ring-2 focus:ring-gray-500 dark:focus:ring-secondary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-800 transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};