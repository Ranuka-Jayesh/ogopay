import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Friend } from '../../types';
import { Users, Search, Filter, Edit, Trash2, User, Phone, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useModal } from './AdminDashboard';

interface ViewAllFriendsProps {
  onFriendSelect: (friend: Friend) => void;
}

export const ViewAllFriends: React.FC<ViewAllFriendsProps> = ({ onFriendSelect }) => {
  const { friends, editFriend, deleteFriend } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBalance, setFilterBalance] = useState<'all' | 'outstanding' | 'settled'>('all');
  const { setEditingFriend, setDeletingFriend } = useModal();

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

  // Filter and search friends
  const filteredFriends = friends.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         friend.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBalance === 'all' ||
                         (filterBalance === 'outstanding' && friend.remainingBalance > 0) ||
                         (filterBalance === 'settled' && friend.remainingBalance === 0);
    
    return matchesSearch && matchesFilter;
  });

  // Helper for avatar (initials)
  const FriendAvatar = ({ name }: { name: string }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-bold text-primary-700 dark:text-primary-300 text-sm shadow">
        {initials}
      </div>
    );
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ 
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1] // Custom easing for smooth feel
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Friends</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click on any friend to view their profile</p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search friends by name or WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        {/* Filter Dropdown */}
        <div className="sm:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterBalance}
              onChange={(e) => setFilterBalance(e.target.value as 'all' | 'outstanding' | 'settled')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-gray-900 dark:text-white appearance-none"
            >
              <option value="all">All Friends</option>
              <option value="outstanding">Outstanding Balance</option>
              <option value="settled">Settled Up</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredFriends.length} of {friends.length} friends
        </p>
        {(searchTerm || filterBalance !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterBalance('all');
            }}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Friends List */}
      {filteredFriends.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterBalance !== 'all' 
              ? 'No friends match your search criteria' 
              : 'No friends added yet. Start by adding your first friend!'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-secondary-700">
              <thead className="bg-gray-50 dark:bg-secondary-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Friend</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Borrowed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Repaid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-secondary-700">
                {filteredFriends.map((friend) => (
                  <tr
                    key={friend.id}
                    className="hover:bg-primary-50 dark:hover:bg-secondary-700 cursor-pointer transition-colors group"
                    onClick={() => onFriendSelect(friend)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <FriendAvatar name={friend.name} />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">{friend.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">📱 {friend.email}</div>
                      </div>
                    </td>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatCurrency(friend.totalBorrowed)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatCurrency(friend.totalRepaid)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-medium ${friend.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {formatCurrency(friend.remainingBalance)}
                                </span>
                              </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setEditingFriend(friend)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                          title="Edit friend"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingFriend(friend)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete friend"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredFriends.map((friend) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-200 dark:border-secondary-700 p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={() => onFriendSelect(friend)}
              >
                {/* Header with Avatar and Actions */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FriendAvatar name={friend.name} />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-base">{friend.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">📱 {friend.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingFriend(friend)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                      title="Edit friend"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingFriend(friend)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete friend"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Borrowed</p>
                                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(friend.totalBorrowed)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Repaid</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(friend.totalRepaid)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance</p>
                              <p className={`text-sm font-semibold ${friend.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(friend.remainingBalance)}
                              </p>
                            </div>
                </div>

                {/* Tap to view hint */}
                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-secondary-700">
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    Tap to view details →
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}; 