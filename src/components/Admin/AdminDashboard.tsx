import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../Shared/Layout';
import { useData } from '../../contexts/DataContext';
import { AddFriend } from './AddFriend';
import { RecordTransaction } from './RecordTransaction';
import { FriendProfile } from './FriendProfile';
import { Friend } from '../../types';
import { Users, Plus, TrendingUp, DollarSign, ArrowUpCircle, ArrowDownCircle, Edit, Trash2, Link, Copy, RefreshCw } from 'lucide-react';
import Lenis from '@studio-freight/lenis';
import { getBaseUrl } from '../../config/environment';

// Create a context for modal management
interface ModalContextType {
  modal: null | 'add-friend' | 'record-transaction';
  setModal: (modal: null | 'add-friend' | 'record-transaction') => void;
  editingFriend: Friend | null;
  setEditingFriend: (friend: Friend | null) => void;
  deletingFriend: Friend | null;
  setDeletingFriend: (friend: Friend | null) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Helper for animated numbers
const AnimatedNumber = ({ value }: { value: number | string }) => {
  const [display, setDisplay] = useState(value);
  React.useEffect(() => {
    if (typeof value === 'number') {
      let start = Number(display.toString().replace(/[^\d.-]/g, '')) || 0;
      let end = value;
      if (start === end) return;
      let frame: number;
      const duration = 600;
      const startTime = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const current = Math.round(start + (end - start) * progress);
        setDisplay(current);
        if (progress < 1) frame = requestAnimationFrame(animate);
        else setDisplay(end);
      };
      frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    } else {
      setDisplay(value);
    }
  }, [value]);
  return <span>{typeof value === 'number' ? display.toLocaleString() : value}</span>;
};

// Helper for avatar (initials)
const FriendAvatar = ({ name }: { name: string }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-bold text-primary-700 dark:text-primary-300 text-sm shadow">
      {initials}
    </div>
  );
};

// Tracking URL component
const TrackingUrlDisplay = ({ trackingUrl }: { trackingUrl?: string }) => {
  const [copied, setCopied] = useState(false);
  const fullUrl = trackingUrl ? `${getBaseUrl()}/track/${trackingUrl}` : '';

  const handleCopy = async () => {
    if (fullUrl) {
      try {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  if (!trackingUrl) {
    return (
      <div className="text-xs text-gray-400 dark:text-gray-500">
        No tracking URL
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link className="h-3 w-3 text-gray-400" />
      <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
        {trackingUrl.slice(0, 8)}...
      </span>
      <button
        onClick={handleCopy}
        className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        title="Copy tracking URL"
      >
        <Copy className="h-3 w-3" />
      </button>
      {copied && (
        <span className="text-xs text-green-600 dark:text-green-400">
          Copied!
        </span>
      )}
    </div>
  );
};

// DeleteConfirmationModal component
const DeleteConfirmationModal = ({ 
  open, 
  onClose, 
  friend, 
  onConfirm 
}: { 
  open: boolean, 
  onClose: () => void, 
  friend: Friend | null, 
  onConfirm: () => void 
}) => {
  return (
    <AnimatePresence>
      {open && friend && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white/90 dark:bg-secondary-800/90 border border-white/20 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 relative backdrop-blur-xl"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirmation-title"
          >
            {/* Close button */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold focus:outline-none transition-colors"
            >
              &times;
            </button>
            
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            {/* Title */}
            <h3 
              id="delete-confirmation-title"
              className="text-xl font-bold text-gray-900 dark:text-white text-center mb-4"
            >
              Delete Friend
            </h3>
            
            {/* Message */}
            <div className="text-center mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{friend.name}</span>?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-700 dark:text-red-300">
                <p className="font-medium mb-2">This action will:</p>
                <ul className="text-left space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    Remove the friend from your list
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    Delete all associated transactions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    This action cannot be undone
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-secondary-600 rounded-xl hover:bg-gray-50 dark:hover:bg-secondary-700 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Delete Friend
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// EditFriendModal component
const EditFriendModal = ({ 
  open, 
  onClose, 
  friend, 
  onSave 
}: { 
  open: boolean, 
  onClose: () => void, 
  friend: Friend | null, 
  onSave: (id: string, name: string, whatsappNumber: string) => void 
}) => {
  const [name, setName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    if (friend) {
      setName(friend.name);
      setWhatsappNumber(friend.email); // email field contains whatsapp number
    }
  }, [friend]);

  const handleSave = () => {
    if (friend && name.trim() && whatsappNumber.trim()) {
      onSave(friend.id, name.trim(), whatsappNumber.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && friend && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white/80 dark:bg-secondary-800/80 border-t-4 border-primary-500 rounded-2xl shadow-2xl p-0 max-w-sm w-full relative flex flex-col items-center backdrop-blur-lg"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-friend-modal-title"
          >
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-xl font-bold focus:outline-none">&times;</button>
            <div className="w-full flex flex-col items-center pt-6 pb-2 px-6">
              <span id="edit-friend-modal-title" className="text-lg sm:text-xl font-bold text-primary-700 dark:text-primary-300 text-center">Edit Friend</span>
            </div>
            <div className="w-full px-6 pb-6 pt-2 text-gray-700 dark:text-gray-200 text-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-700 dark:text-white"
                  placeholder="Enter friend's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WhatsApp Number</label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-700 dark:text-white"
                  placeholder="Enter friend's WhatsApp number"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-secondary-600 rounded-lg hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!name.trim() || !whatsappNumber.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// DashboardModal component
const DashboardModal = ({ open, onClose, title, children }: { open: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white/80 dark:bg-secondary-800/80 border-t-4 border-primary-500 rounded-2xl shadow-2xl p-0 max-w-xs sm:max-w-sm w-full relative flex flex-col items-center backdrop-blur-lg"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dashboard-modal-title"
        >
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-xl font-bold focus:outline-none">&times;</button>
          <div className="w-full flex flex-col items-center pt-6 pb-2 px-6">
            <span id="dashboard-modal-title" className="text-lg sm:text-xl font-bold text-primary-700 dark:text-primary-300 text-center">{title}</span>
          </div>
          <div className="w-full px-6 pb-6 pt-2 text-gray-700 dark:text-gray-200 text-sm">
            {children}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const AdminDashboard: React.FC = () => {
  const { friends, transactions, editFriend, deleteFriend, refreshData, isLoading } = useData();
  const [activeTab, setActiveTab] = useState<'overview' | 'add-friend' | 'record-transaction'>('overview');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [modal, setModal] = useState<null | 'add-friend' | 'record-transaction'>(null);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [deletingFriend, setDeletingFriend] = useState<Friend | null>(null);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  // Create modal context value
  const modalContextValue: ModalContextType = {
    modal,
    setModal,
    editingFriend,
    setEditingFriend,
    deletingFriend,
    setDeletingFriend
  };

  const totalLent = transactions
    .filter(t => t.type === 'loan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRepaid = transactions
    .filter(t => t.type === 'repayment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutstanding = totalLent - totalRepaid;

  const stats = [
    {
      title: 'Total Friends',
      value: friends.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Lent',
      value: `$${totalLent.toLocaleString()}`,
      icon: ArrowUpCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Total Repaid',
      value: `$${totalRepaid.toLocaleString()}`,
      icon: ArrowDownCircle,
      color: 'bg-amber-500'
    },
    {
      title: 'Outstanding',
      value: `$${totalOutstanding.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-red-500'
    }
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: TrendingUp }
  ];

  useEffect(() => {
    // Only enable Lenis on desktop
    let lenis: any = null;
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      lenis = new Lenis({
        lerp: 0.08,
        duration: 1.2,
        gestureOrientation: 'vertical',
        smoothWheel: true,
      });
      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
    return () => {
      if (lenis) lenis.destroy();
    };
  }, []);

  // If a friend is selected, show their profile
  if (selectedFriend) {
    return (
      <ModalContext.Provider value={modalContextValue}>
        <Layout 
          title={`${selectedFriend.name}'s Profile`}
          showAdminActions
          onAddFriend={() => setModal('add-friend')}
          onRecordTransaction={() => setModal('record-transaction')}
        >
          <FriendProfile 
            friend={selectedFriend} 
            onBack={() => setSelectedFriend(null)}
          />
        </Layout>
        {/* Modals for FriendProfile */}
        <DashboardModal
          open={modal === 'add-friend'}
          onClose={() => {
            setModal(null);
            setTimeout(() => refreshData(), 500);
          }}
          title="Add Friend"
        >
          <AddFriend onSuccess={() => {
            setModal(null);
            setTimeout(() => refreshData(), 500);
          }} />
        </DashboardModal>
        <DashboardModal
          open={modal === 'record-transaction'}
          onClose={() => {
            setModal(null);
            setTimeout(() => refreshData(), 500);
          }}
          title="Record Transaction"
        >
          <RecordTransaction onSuccess={() => {
            setModal(null);
            setTimeout(() => refreshData(), 500);
          }} />
        </DashboardModal>
        <EditFriendModal
          open={editingFriend !== null}
          onClose={() => {
            setEditingFriend(null);
            setTimeout(() => refreshData(), 500);
          }}
          friend={editingFriend}
          onSave={(id, name, whatsappNumber) => {
            editFriend(id, name, whatsappNumber);
            setEditingFriend(null);
            setTimeout(() => refreshData(), 500);
          }}
        />
        <DeleteConfirmationModal
          open={deletingFriend !== null}
          onClose={() => {
            setDeletingFriend(null);
            setTimeout(() => refreshData(), 500);
          }}
          friend={deletingFriend}
          onConfirm={() => {
            if (deletingFriend) {
              deleteFriend(deletingFriend.id);
              setDeletingFriend(null);
              setTimeout(() => refreshData(), 500);
            }
          }}
        />
      </ModalContext.Provider>
    );
  }

  // Stats grid redesign
  return (
    <ModalContext.Provider value={modalContextValue}>
      <Layout
        title="Admin Dashboard"
        showAdminActions
        onAddFriend={() => setModal('add-friend')}
        onRecordTransaction={() => setModal('record-transaction')}
      >
      <div className="space-y-8">
        {/* Stats Grid - Redesigned */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6, type: 'spring' }}
              className="relative bg-gradient-to-br from-primary-50 to-emerald-100 dark:from-secondary-900 dark:to-secondary-800 rounded-2xl shadow-lg p-6 border border-primary-100 dark:border-secondary-700 overflow-hidden flex flex-col justify-between min-h-[140px]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                    <AnimatedNumber value={typeof stat.value === 'string' && stat.value.startsWith('$') ? Number(stat.value.replace(/[^\d.-]/g, '')) : stat.value} />
                    {typeof stat.value === 'string' && stat.value.startsWith('$') ? <span className="ml-1 text-lg font-normal">$</span> : null}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl shadow-lg`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Placeholder for Chart (to be implemented with Tremor) */}
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 border border-primary-100 dark:border-secondary-700 flex flex-col items-center justify-center min-h-[220px]">
          <span className="text-lg font-semibold text-primary-600 dark:text-primary-300 mb-2">Financial Overview (Coming Soon)</span>
          <div className="w-full h-32 flex items-center justify-center text-gray-400 dark:text-gray-600">[Chart Placeholder]</div>
        </div>
        {/* Tab Navigation and Friends List with Avatars */}
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-primary-100 dark:border-secondary-700">
          <div className="border-b border-primary-100 dark:border-secondary-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-secondary-600'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Friends Overview</h3>
                  <div className="flex items-center gap-3">
                    {isLoading && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                        <span>Refreshing...</span>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        refreshData();
                        setRefreshSuccess(true);
                        setTimeout(() => setRefreshSuccess(false), 3000);
                      }}
                      disabled={isLoading}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh data"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                {refreshSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Data refreshed successfully!</span>
                    </div>
                  </div>
                )}
                {friends.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No friends added yet. Start by adding your first friend!</p>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tracking URL</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-secondary-700">
                          {friends.map((friend) => (
                            <tr
                              key={friend.id}
                              className="hover:bg-primary-50 dark:hover:bg-secondary-700 cursor-pointer transition-colors"
                              onClick={() => setSelectedFriend(friend)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                                <FriendAvatar name={friend.name} />
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{friend.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">📱 {friend.email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                ${friend.totalBorrowed.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                ${friend.totalRepaid.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-medium ${friend.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  ${friend.remainingBalance.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <TrackingUrlDisplay trackingUrl={friend.trackingUrl} />
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
                                    onClick={() => {
                                      setDeletingFriend(friend);
                                    }}
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
                       <div className="mt-4 text-center">
                         <p className="text-sm text-gray-500 dark:text-gray-400">
                           Click on any friend to view their detailed profile and transaction history
                         </p>
                       </div>
                     </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                      {friends.map((friend) => (
                        <motion.div
                          key={friend.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-200 dark:border-secondary-700 p-4 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => setSelectedFriend(friend)}
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
                                ${friend.totalBorrowed.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Repaid</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                ${friend.totalRepaid.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance</p>
                              <p className={`text-sm font-semibold ${friend.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ${friend.remainingBalance.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Tracking URL */}
                          <div className="border-t border-gray-100 dark:border-secondary-700 pt-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Link className="h-4 w-4 text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">Tracking URL</span>
                              </div>
                              {friend.trackingUrl && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(`${getBaseUrl()}/track/${friend.trackingUrl}`);
                                  }}
                                  className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                  title="Copy tracking URL"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                            {friend.trackingUrl ? (
                              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono mt-1 truncate">
                                {friend.trackingUrl.slice(0, 12)}...
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No tracking URL</p>
                            )}
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
              </div>
            )}
            {activeTab === 'add-friend' && <AddFriend />}
            {activeTab === 'record-transaction' && <RecordTransaction />}
          </div>
        </div>
        {/* Floating Action Button for Quick Actions */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-5 items-end">
          <motion.button
            onClick={() => setModal('add-friend')}
            title="Add Friend"
            className="relative bg-primary-600 text-white rounded-full shadow-lg p-4 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
            whileHover={{ scale: 1.12, boxShadow: '0 0 0 8px rgba(16,185,129,0.15)' }}
            whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: [
              '0 0 0 0 rgba(16,185,129,0.15)',
              '0 0 0 8px rgba(16,185,129,0.10)',
              '0 0 0 0 rgba(16,185,129,0.15)'
            ] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <Users className="h-6 w-6" />
          </motion.button>
          <motion.button
            onClick={() => setModal('record-transaction')}
            title="Record Transaction"
            className="relative bg-emerald-500 text-white rounded-full shadow-lg p-4 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            whileHover={{ scale: 1.12, boxShadow: '0 0 0 8px rgba(16,185,129,0.15)' }}
            whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: [
              '0 0 0 0 rgba(16,185,129,0.15)',
              '0 0 0 8px rgba(16,185,129,0.10)',
              '0 0 0 0 rgba(16,185,129,0.15)'
            ] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        </div>
      </div>
      {/* Dashboard Modals - move outside main content to cover header */}
      <DashboardModal
        open={modal === 'add-friend'}
        onClose={() => {
          setModal(null);
          // Auto-refresh data when modal closes
          setTimeout(() => refreshData(), 500);
        }}
        title="Add Friend"
      >
        <AddFriend onSuccess={() => {
          setModal(null);
          // Auto-refresh data when friend is added successfully
          setTimeout(() => refreshData(), 500);
        }} />
      </DashboardModal>
      <DashboardModal
        open={modal === 'record-transaction'}
        onClose={() => {
          setModal(null);
          // Auto-refresh data when modal closes
          setTimeout(() => refreshData(), 500);
        }}
        title="Record Transaction"
      >
        <RecordTransaction onSuccess={() => {
          setModal(null);
          // Auto-refresh data when transaction is recorded successfully
          setTimeout(() => refreshData(), 500);
        }} />
      </DashboardModal>
      <EditFriendModal
        open={editingFriend !== null}
        onClose={() => {
          setEditingFriend(null);
          // Auto-refresh data when edit modal closes
          setTimeout(() => refreshData(), 500);
        }}
        friend={editingFriend}
        onSave={(id, name, whatsappNumber) => {
          editFriend(id, name, whatsappNumber);
          setEditingFriend(null);
          // Auto-refresh data when friend is edited successfully
          setTimeout(() => refreshData(), 500);
        }}
      />
      <DeleteConfirmationModal
        open={deletingFriend !== null}
        onClose={() => {
          setDeletingFriend(null);
          // Auto-refresh data when delete modal closes
          setTimeout(() => refreshData(), 500);
        }}
        friend={deletingFriend}
        onConfirm={() => {
          if (deletingFriend) {
            deleteFriend(deletingFriend.id);
            setDeletingFriend(null);
            // Auto-refresh data when friend is deleted successfully
            setTimeout(() => refreshData(), 500);
          }
        }}
      />
    </Layout>
    </ModalContext.Provider>
  );
};