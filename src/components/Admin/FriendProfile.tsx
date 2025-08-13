import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Friend, Transaction } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { TransactionSlip } from './TransactionSlip';
import { ArrowLeft, User, Mail, DollarSign, TrendingUp, TrendingDown, Clock, ArrowUpCircle, ArrowDownCircle, Link, Copy, Share2, Edit, Trash2, RefreshCw, Search, Filter, Calendar } from 'lucide-react';
import { getFullTrackingUrl } from '../../utils/trackingUrl';
import { useModal } from './AdminDashboard';

interface FriendProfileProps {
  friend: Friend;
  onBack: () => void;
}

export const FriendProfile: React.FC<FriendProfileProps> = ({ friend, onBack }) => {
  const { getFriendTransactions, updateTrackingCode, refreshData } = useData();
  const { user } = useAuth();
  const { setEditingFriend, setDeletingFriend } = useModal();
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [copyCodeSuccess, setCopyCodeSuccess] = React.useState(false);
  const [shareSuccess, setShareSuccess] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [regenerateSuccess, setRegenerateSuccess] = React.useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = React.useState(false);
  const [countdown, setCountdown] = React.useState(3);
  const [newGeneratedCode, setNewGeneratedCode] = React.useState<string>('');
  const [showNewCode, setShowNewCode] = React.useState(false);
  const [lotteryDigits, setLotteryDigits] = React.useState(['0', '0', '0', '0']);
  const [isLotteryRunning, setIsLotteryRunning] = React.useState(false);
  const [showGeneratedNumber, setShowGeneratedNumber] = React.useState(false);
  const [generatedCode, setGeneratedCode] = React.useState('');
  
  // Enhanced share fallback function
  const enhancedShareFallback = async (text: string, title: string) => {
    try {
      // Try to copy to clipboard first
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
      
      // Show success message
      console.log('Content copied to clipboard successfully');
      
      // Try to show a more user-friendly message
      if (window.confirm(`${title}\n\nContent has been copied to your clipboard!\n\nWould you like to open your default email client to share this?`)) {
        // Try to open default email client
        const subject = encodeURIComponent(title);
        const body = encodeURIComponent(text);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
      }
    } catch (clipboardError) {
      console.error('Clipboard failed:', clipboardError);
      // Last resort - show alert with content
      alert(`${title}\n\n${text}\n\nPlease copy this information manually.`);
    }
  };
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState<'all' | 'loan' | 'repayment'>('all');
  const [sortBy, setSortBy] = React.useState<'date' | 'amount' | 'type'>('date');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const calendarRef = React.useRef<HTMLDivElement>(null);
  
  const transactions = getFriendTransactions(friend.id);

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

  // Enhanced filtering and sorting with date range
  const filteredAndSortedTransactions = React.useMemo(() => {
    if (!transactions) return [];

    let filtered = transactions.filter(transaction => {
      // Text search
      const matchesSearch = searchTerm === '' || 
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.amount.toString().includes(searchTerm);

      // Type filter
      const matchesType = filterType === 'all' || transaction.type === filterType;

      // Date range filter
      let matchesDate = true;
      if (startDate || endDate) {
        const transactionDate = new Date(transaction.date);
        const start = startDate;
        const end = endDate;

        if (start && end) {
          matchesDate = transactionDate >= start && transactionDate <= end;
        } else if (start) {
          matchesDate = transactionDate >= start;
        } else if (end) {
          matchesDate = transactionDate <= end;
        }
      }

      return matchesSearch && matchesType && matchesDate;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [transactions, searchTerm, filterType, sortBy, sortOrder, startDate, endDate]);

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isDateInRange = (date: Date) => {
    if (!startDate && !endDate) return false;
    if (startDate && endDate) {
      return date >= startDate && date <= endDate;
    }
    if (startDate) {
      return date >= startDate;
    }
    if (endDate) {
      return date <= endDate;
    }
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (startDate && date.toDateString() === startDate.toDateString()) return true;
    if (endDate && date.toDateString() === endDate.toDateString()) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (date > startDate) {
        setEndDate(date);
      } else {
        setStartDate(date);
        setEndDate(null);
      }
    }
  };

  const handleDateHover = (date: Date) => {
    if (startDate && !endDate && date > startDate) {
      setHoverDate(date);
    }
  };

  const clearDateRange = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    } else if (startDate) {
      return `From ${startDate.toLocaleDateString()}`;
    } else if (endDate) {
      return `Until ${endDate.toLocaleDateString()}`;
    }
    return 'Select date range';
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Click outside handler for calendar
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Helper function to show confirmation popup
  const showRegenerateConfirmPopup = () => {
    setShowRegenerateConfirm(true);
  };

  // Helper function to regenerate access code with lottery machine effect
  const regenerateAccessCode = async () => {
    if (!friend.tracking_code) return;
    
    setShowRegenerateConfirm(false);
    setIsRegenerating(true);
    setIsLotteryRunning(true);
    
    // Start countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    try {
      // Generate new 4-digit code
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      const finalDigits = newCode.split('');
      
      // Lottery machine effect - each digit counts down from 9 to 1 repeatedly
      const spinDuration = 3000; // 3 seconds total
      const spinInterval = 100; // 100ms per update
      const totalSteps = spinDuration / spinInterval;
      
      // Track current values for each digit
      let digit1Value = 9;
      let digit2Value = 9;
      let digit3Value = 9;
      let digit4Value = 9;
      
      // Track when each digit should settle
      let digit1Settled = false;
      let digit2Settled = false;
      let digit3Settled = false;
      let digit4Settled = false;
      
      for (let step = 0; step < totalSteps; step++) {
        const progress = step / totalSteps;
        
        // Determine when each digit should settle (random timing)
        if (!digit1Settled && progress > 0.2 + Math.random() * 0.1) {
          digit1Settled = true;
        }
        if (!digit2Settled && progress > 0.4 + Math.random() * 0.1) {
          digit2Settled = true;
        }
        if (!digit3Settled && progress > 0.6 + Math.random() * 0.1) {
          digit3Settled = true;
        }
        if (!digit4Settled && progress > 0.8 + Math.random() * 0.1) {
          digit4Settled = true;
        }
        
        // Update digit values
        if (!digit1Settled) {
          digit1Value = digit1Value > 1 ? digit1Value - 1 : 9;
        } else {
          digit1Value = parseInt(finalDigits[0]);
        }
        
        if (!digit2Settled) {
          digit2Value = digit2Value > 1 ? digit2Value - 1 : 9;
        } else {
          digit2Value = parseInt(finalDigits[1]);
        }
        
        if (!digit3Settled) {
          digit3Value = digit3Value > 1 ? digit3Value - 1 : 9;
        } else {
          digit3Value = parseInt(finalDigits[2]);
        }
        
        if (!digit4Settled) {
          digit4Value = digit4Value > 1 ? digit4Value - 1 : 9;
        } else {
          digit4Value = parseInt(finalDigits[3]);
        }
        
        const newDigits = [
          digit1Value.toString(),
          digit2Value.toString(),
          digit3Value.toString(),
          digit4Value.toString()
        ];
        
        setLotteryDigits(newDigits);
        await new Promise(resolve => setTimeout(resolve, spinInterval));
      }
      
      // Ensure final digits are correct
      setLotteryDigits(finalDigits);
      
      // Show generated number for 5 seconds
      setGeneratedCode(newCode);
      setShowGeneratedNumber(true);
      setIsLotteryRunning(false);
      
      // Wait 5 seconds to display the generated number
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Update in database
      const success = await updateTrackingCode(friend.id, newCode);
      
      if (success) {
        // Store the new generated code for display
        setNewGeneratedCode(newCode);
        setShowNewCode(true);
        
        // Refresh data to get the updated friend information
        refreshData();
        
        setRegenerateSuccess(true);
        setTimeout(() => setRegenerateSuccess(false), 3000);
        
        // Keep showing the new code for 10 seconds
        setTimeout(() => {
          setShowNewCode(false);
          setNewGeneratedCode('');
        }, 10000);
      } else {
        console.error('Failed to update tracking code');
        setShowNewCode(false);
        setNewGeneratedCode('');
      }
    } catch (error) {
      console.error('Failed to regenerate access code:', error);
      setShowNewCode(false);
      setNewGeneratedCode('');
    } finally {
      setIsRegenerating(false);
      setIsLotteryRunning(false);
      setShowGeneratedNumber(false);
      setCountdown(3);
    }
  };

  // Helper function to generate interactive share message

  const stats = [
    {
      title: 'Total Borrowed',
              value: formatCurrency(friend.totalBorrowed),
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Repaid',
              value: formatCurrency(friend.totalRepaid),
      icon: TrendingDown,
      color: 'bg-green-500'
    },
    {
      title: 'Remaining Balance',
              value: formatCurrency(friend.remainingBalance),
      icon: DollarSign,
      color: friend.remainingBalance > 0 ? 'bg-red-500' : 'bg-green-500'
    }
  ];

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ 
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1]
      }}
    >
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

      {/* Tracking URL and Code Section */}
      {friend.trackingUrl && (
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-secondary-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Link className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tracking Access</h3>
            </div>
            <span className="text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">
              Secure Access
            </span>
          </div>
          
          {/* Tracking URL */}
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
                {shareSuccess && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    ✓ Shared successfully!
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
                    onClick={async () => {
                      if (!friend.trackingUrl) return;
                      
                      const urlShareMessage = `🔗 Ogo Pay - Transaction History

👨‍💼 Shared by: ${user?.full_name || 'Admin'}
📞 Admin Contact: ${user?.whatsapp_number || user?.email || 'Contact admin'}

👤 To : ${friend.name}
📱 Contact: ${friend.email}

📅 Shared on: ${new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}

🔐 Secure Access Required
Your transaction history is ready to view. You'll need the 4-digit access code to view your details.

📊 What you'll see:
• All your loans and repayments
• Current balance status
• Complete transaction history
• Real-time updates

🛡 Security Note:
The access code will be shared separately for your security.

🔗 Your Tracking URL:
${getFullTrackingUrl(friend.trackingUrl)}

📧 Support: ogopay@ogotechnology.net

---
Powered by Ogo Technology - www.ogotechnology.net`;
                    
                    try {
                      if (navigator.share && navigator.canShare({ text: urlShareMessage })) {
                        await navigator.share({
                          title: `Ogo Pay - ${friend.name}'s Transaction History`,
                          text: urlShareMessage
                        });
                        console.log('Transaction history shared successfully via Web Share API');
                        setShareSuccess(true);
                        setTimeout(() => setShareSuccess(false), 3000);
                      } else {
                        await enhancedShareFallback(urlShareMessage, `Ogo Pay - ${friend.name}'s Transaction History`);
                      }
                    } catch (error) {
                      console.error('Share failed:', error);
                      await enhancedShareFallback(urlShareMessage, `Ogo Pay - ${friend.name}'s Transaction History`);
                    }
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  title="Share tracking URL with interactive message"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tracking Code */}
          {friend.tracking_code ? (
            <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Access Code (4-digit)</p>
                  <div className="flex items-center space-x-2">
                    <motion.p 
                      className={`text-lg font-mono tracking-widest px-3 py-1 rounded border ${
                        showNewCode 
                          ? 'text-green-900 dark:text-green-100 bg-green-100 dark:bg-green-700 border-green-300 dark:border-green-600' 
                          : 'text-gray-900 dark:text-white bg-white dark:bg-secondary-600'
                      }`}
                      animate={showNewCode ? {
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 0 0 rgba(34, 197, 94, 0)",
                          "0 0 20px rgba(34, 197, 94, 0.5)",
                          "0 0 0 rgba(34, 197, 94, 0)"
                        ]
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {showNewCode ? newGeneratedCode : friend.tracking_code}
                    </motion.p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Required to view history</span>
                    {showNewCode && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium animate-pulse">
                        ✓ New Code Generated!
                      </span>
                    )}
                    {copyCodeSuccess && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✓ Code copied!
                      </p>
                    )}
                    {regenerateSuccess && (
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium animate-pulse">
                        ✓ New access code generated and saved!
                      </p>
                    )}
                  </div>
                </div>
                                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={async () => {
                        const codeToCopy = showNewCode ? newGeneratedCode : friend.tracking_code;
                        if (!codeToCopy) return;
                        try {
                          await navigator.clipboard.writeText(codeToCopy);
                          setCopyCodeSuccess(true);
                          setTimeout(() => setCopyCodeSuccess(false), 2000);
                        } catch (err) {
                          console.error('Failed to copy code:', err);
                        }
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      title="Copy tracking code"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        const codeToShare = showNewCode ? newGeneratedCode : friend.tracking_code;
                        if (!codeToShare) return;
                        const accessCodeMessage = `🔐 Ogo Pay - Access Code

👨‍💼 Shared by: ${user?.full_name || 'Admin'}
📞 Admin Contact: ${user?.whatsapp_number || user?.email || 'Contact admin'}

👤 To : ${friend.name}
📱 Contact: ${friend.email}

🔢 Your Access Code: ${codeToShare}

⚠️ Important:
• Keep this code secure
• Don't share with others
• Enter it on the tracking page to view your history

📅 Generated on: ${new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}

📧 Support: ogopay@ogotechnology.net

---
Powered by Ogo Technology - www.ogotechnology.net`;
                        
                        try {
                          if (navigator.share && navigator.canShare({ text: accessCodeMessage })) {
                            await navigator.share({
                              title: `Ogo Pay - Access Code for ${friend.name}`,
                              text: accessCodeMessage
                            });
                            console.log('Access code shared successfully via Web Share API');
                          } else {
                            await enhancedShareFallback(accessCodeMessage, `Ogo Pay - Access Code for ${friend.name}`);
                          }
                        } catch (error) {
                          console.error('Share failed:', error);
                          await enhancedShareFallback(accessCodeMessage, `Ogo Pay - Access Code for ${friend.name}`);
                        }
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                      title="Share access code with message"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={showRegenerateConfirmPopup}
                      disabled={isRegenerating}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Regenerate access code"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-4 border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center space-x-2">
                <div className="text-yellow-600 dark:text-yellow-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Access Code Not Available</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">This friend was created before the tracking code feature was added. Please contact support to update.</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>• Share the URL with {friend.name} to access their transaction history</p>
            <p>• They will need to enter the 4-digit code to view the history</p>
            <p>• The page shows all loans, repayments, and current balance</p>
            <p>• Keep the access code secure and share it separately for security</p>
          </div>
          
          {/* Share All Button */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-secondary-600">
            <button
              onClick={async () => {
                if (!friend.trackingUrl || !friend.tracking_code) return;
                
                const completeMessage = `🔗 Ogo Pay - Complete Access

👨‍💼 Shared by: ${user?.full_name || 'Admin'}
📞 Admin Contact: ${user?.whatsapp_number || user?.email || 'Contact admin'}

👤 To : ${friend.name}
📱 Contact: ${friend.email}

📅 Shared on: ${new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}

🔐 Secure Access Required
Your transaction history is ready to view. You'll need the 4-digit access code to view your details.

📊 What you'll see:
• All your loans and repayments
• Current balance status
• Complete transaction history
• Real-time updates

🛡 Security Note:
The access code will be shared separately for your security.

🔗 Your Tracking URL:
${getFullTrackingUrl(friend.trackingUrl)}

🔐 Your Access Code: ${friend.tracking_code}

📱 How to use:
1. Click the tracking URL above
2. Enter the access code when prompted
3. View your complete transaction history

🛡 Security Reminder:
This information is private. Keep it secure and don't share with others.

📧 Support: ogopay@ogotechnology.net

---
Powered by Ogo Technology - www.ogotechnology.net`;
                
                try {
                  if (navigator.share && navigator.canShare({ text: completeMessage })) {
                    await navigator.share({
                      title: `Ogo Pay - Complete Access for ${friend.name}`,
                      text: completeMessage
                    });
                    console.log('Complete access shared successfully via Web Share API');
                  } else {
                    await enhancedShareFallback(completeMessage, `Ogo Pay - Complete Access for ${friend.name}`);
                  }
                } catch (error) {
                  console.error('Share failed:', error);
                  await enhancedShareFallback(completeMessage, `Ogo Pay - Complete Access for ${friend.name}`);
                }
              }}
              className="w-full bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Share2 className="h-5 w-5" />
              Share Complete Access
            </button>
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
                {friend.name} owes <span className="font-bold">{formatCurrency(friend.remainingBalance)}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Overview */}
      <motion.div 
        className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-secondary-700/50 dark:to-blue-900/20 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-secondary-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction Overview</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visual Chart Representation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Loans vs Repayments</span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Loans</span>
                <div className="w-3 h-3 bg-green-500 rounded-full ml-3"></div>
                <span className="text-xs text-gray-500">Repayments</span>
              </div>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-16">Loans</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <motion.div 
                    className="bg-blue-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((friend.totalBorrowed || 0) / Math.max(friend.totalBorrowed || 1, friend.totalRepaid || 1) * 100, 100)}%` }}
                    transition={{ delay: 0.8, duration: 1 }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                  {formatCurrency(friend.totalBorrowed || 0)}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-16">Repaid</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <motion.div 
                    className="bg-green-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((friend.totalRepaid || 0) / Math.max(friend.totalBorrowed || 1, friend.totalRepaid || 1) * 100, 100)}%` }}
                    transition={{ delay: 0.9, duration: 1 }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                  {formatCurrency(friend.totalRepaid || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-secondary-700 rounded-xl p-4 border border-gray-200 dark:border-secondary-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {friend.totalBorrowed ? Math.round((friend.totalRepaid || 0) / friend.totalBorrowed * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${friend.totalBorrowed ? Math.min((friend.totalRepaid || 0) / friend.totalBorrowed * 100, 100) : 0}%` }}
                  transition={{ delay: 1, duration: 1 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-secondary-700 rounded-xl p-3 border border-gray-200 dark:border-secondary-600 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Transactions</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {transactions.length || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-secondary-700 rounded-xl p-3 border border-gray-200 dark:border-secondary-600 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Amount</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {transactions.length ? formatCurrency(friend.totalBorrowed / transactions.length) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div 
        className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-secondary-700/50 dark:to-blue-900/20 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-secondary-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
            <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search & Filter</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-secondary-600 rounded-xl bg-white dark:bg-secondary-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'loan' | 'repayment')}
              className="w-full px-4 py-3 border border-gray-200 dark:border-secondary-600 rounded-xl bg-white dark:bg-secondary-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
            >
              <option value="all">All Types</option>
              <option value="loan">Loans Only</option>
              <option value="repayment">Repayments Only</option>
            </select>
          </div>

          {/* Date Range Picker */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-secondary-600 rounded-xl bg-white dark:bg-secondary-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 text-left"
            >
              {formatDateRange()}
            </button>
            {showCalendar && (
              <div className="absolute z-50 mt-2 w-80 bg-white dark:bg-secondary-800 rounded-xl shadow-2xl border border-gray-200 dark:border-secondary-600" ref={calendarRef}>
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-secondary-600">
                  <motion.button
                    onClick={goToPreviousMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.button>
                  
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <motion.button
                      onClick={() => setCurrentMonth(new Date())}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors mt-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Today
                    </motion.button>
                  </div>
                  
                  <motion.button
                    onClick={goToNextMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>

                {/* Calendar Grid */}
                <div className="p-4">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentMonth).map((day, index) => (
                      <div key={index} className="relative">
                        {day ? (
                          <motion.button
                            onClick={() => {
                              handleDateClick(day);
                              // Close calendar after selecting both dates
                              if (startDate && !endDate && day > startDate) {
                                setTimeout(() => setShowCalendar(false), 300);
                              }
                            }}
                            onMouseEnter={() => handleDateHover(day)}
                            onMouseLeave={() => setHoverDate(null)}
                            className={`w-full h-10 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                              isDateSelected(day)
                                ? 'bg-primary-600 text-white shadow-lg scale-110'
                                : isDateInRange(day)
                                ? 'bg-primary-100 text-primary-800 dark:bg-primary-800/30 dark:text-primary-200'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {day.getDate()}
                            {/* Current date indicator */}
                            {day.toDateString() === new Date().toDateString() && !isDateSelected(day) && (
                              <div className="absolute inset-0 border-2 border-primary-500 rounded-lg" />
                            )}
                            {/* Visual indicator for range selection */}
                            {startDate && !endDate && hoverDate && day > startDate && day <= hoverDate && (
                              <div className="absolute inset-0 bg-primary-200/50 dark:bg-primary-700/50 rounded-lg -z-10" />
                            )}
                          </motion.button>
                        ) : (
                          <div className="w-full h-10" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-secondary-600 bg-gray-50 dark:bg-secondary-700/50 rounded-b-xl">
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <motion.button
                      onClick={() => {
                        const today = new Date();
                        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        setStartDate(lastWeek);
                        setEndDate(today);
                      }}
                      className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Last 7 days
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        const today = new Date();
                        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                        setStartDate(lastMonth);
                        setEndDate(today);
                      }}
                      className="px-3 py-1 text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Last 30 days
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        const today = new Date();
                        const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
                        setStartDate(lastYear);
                        setEndDate(today);
                      }}
                      className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Last year
                    </motion.button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {startDate && endDate ? (
                        <span>Selected: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</span>
                      ) : startDate ? (
                        <span>Start: {startDate.toLocaleDateString()}</span>
                      ) : (
                        <span>Click to select date range</span>
                      )}
                    </div>
                    {(startDate || endDate) && (
                      <motion.button
                        onClick={() => {
                          clearDateRange();
                          setShowCalendar(false);
                        }}
                        className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Clear
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-secondary-600">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'type')}
              className="px-3 py-2 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="type">Type</option>
            </select>
          </div>

          <motion.button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {sortOrder === 'asc' ? (
              <>
                <span>Oldest First</span>
                <motion.div
                  animate={{ rotate: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ↑
                </motion.div>
              </>
            ) : (
              <>
                <span>Newest First</span>
                <motion.div
                  animate={{ rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  ↑
                </motion.div>
              </>
            )}
          </motion.button>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || filterType !== 'all' || startDate || endDate) && (
          <motion.button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              clearDateRange();
            }}
            className="mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear all filters
          </motion.button>
        )}
      </motion.div>

      {/* Interactive Transaction History */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-secondary-800 dark:to-secondary-900 rounded-xl shadow-lg border border-gray-200 dark:border-secondary-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-secondary-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-secondary-700 dark:to-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transaction History</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} • Showing {filteredAndSortedTransactions.length}
                {(searchTerm || filterType !== 'all' || startDate || endDate) && (
                  <span className="ml-2 text-primary-600 dark:text-primary-400 font-medium">
                    (filtered)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Loans</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Repayments</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {filteredAndSortedTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              {transactions.length === 0 ? (
                <>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions recorded yet.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Use the "Record Transaction" tab to add loans or repayments.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions match your filters.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Try adjusting your search terms, filters, or date range.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAndSortedTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
                    transaction.type === 'loan' 
                      ? 'bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-red-200 dark:border-red-800/30 hover:border-red-300 dark:hover:border-red-700/50' 
                      : 'bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-green-200 dark:border-green-800/30 hover:border-green-300 dark:hover:border-green-700/50'
                  }`}
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    transaction.type === 'loan' ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  
                  <div className="flex items-center p-3 pl-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 mr-3 p-2 rounded-lg ${
                      transaction.type === 'loan' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    }`}>
                      {transaction.type === 'loan' ? (
                        <ArrowUpCircle className="h-4 w-4" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4" />
                      )}
                    </div>
                    
                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-semibold ${
                            transaction.type === 'loan' 
                              ? 'text-red-700 dark:text-red-300' 
                              : 'text-green-700 dark:text-green-300'
                          }`}>
                            {transaction.type === 'loan' ? 'LOAN' : 'REPAYMENT'}
                          </span>
                          <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.type === 'loan' 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {transaction.type === 'loan' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          transaction.type === 'loan' 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        }`}>
                          {transaction.type === 'loan' ? 'Lent' : 'Repaid'}
                        </span>
                      </div>
                      
                      {transaction.description && (
                        <div className="mt-2 p-2 bg-white/70 dark:bg-gray-800/50 rounded border-l-2 border-gray-300 dark:border-gray-600">
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Note:</span> {transaction.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Interactive Action Bar */}
                  <div className={`px-4 py-2 border-t transition-all duration-300 ${
                    transaction.type === 'loan' 
                      ? 'border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10' 
                      : 'border-green-200 dark:border-green-800/30 bg-green-50/50 dark:bg-green-900/10'
                  }`}>
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 ${
                        transaction.type === 'loan'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                      }`}
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Generate Slip & Share</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Card */}
      {filteredAndSortedTransactions.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
          <h4 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4">Transaction Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {filteredAndSortedTransactions.filter(t => t.type === 'loan').length}
              </p>
              <p className="text-sm text-primary-700 dark:text-primary-300">Loans</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {filteredAndSortedTransactions.filter(t => t.type === 'repayment').length}
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">Repayments</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {filteredAndSortedTransactions.length > 0 ? formatCurrency(Math.max(...filteredAndSortedTransactions.map(t => t.amount))) : formatCurrency(0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Largest Amount</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {filteredAndSortedTransactions.length > 0 ? formatCurrency(Math.min(...filteredAndSortedTransactions.map(t => t.amount))) : formatCurrency(0)}
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

      {/* Regenerate Confirmation Modal */}
      <AnimatePresence>
        {showRegenerateConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
                  <RefreshCw className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Regenerate Access Code?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  This will generate a new 4-digit access code for <span className="font-medium text-gray-900 dark:text-white">{friend.name}</span>. 
                  The old code will no longer work.
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowRegenerateConfirm(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={regenerateAccessCode}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown Modal */}
      <AnimatePresence>
        {isRegenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full text-center"
            >
              {!isLotteryRunning && !showGeneratedNumber ? (
                <>
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
                    <RefreshCw className="h-8 w-8 text-orange-600 dark:text-orange-400 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Regenerating Access Code
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Generating new code in...
                  </p>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-4">
                    {countdown}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Please wait while we update the database...
                  </p>
                </>
              ) : showGeneratedNumber ? (
                <>
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                    <div className="h-8 w-8 text-green-600 dark:text-green-400 text-2xl font-bold">✓</div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    New Access Code Generated!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Your new 4-digit access code:
                  </p>
                  
                  {/* Generated Number Display */}
                  <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                    <div className="flex justify-center space-x-2">
                      {generatedCode.split('').map((digit, index) => (
                        <motion.div
                          key={index}
                          className="w-12 h-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-300 dark:border-green-600 flex items-center justify-center text-2xl font-bold text-green-600 dark:text-green-400"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.1
                          }}
                        >
                          {digit}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Saving to database...
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
                    <RefreshCw className="h-8 w-8 text-orange-600 dark:text-orange-400 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Code Generating
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Generating your new access code...
                  </p>
                  
                  {/* Lottery Machine Display */}
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex justify-center space-x-2">
                      {lotteryDigits.map((digit, index) => (
                        <motion.div
                          key={index}
                          className="w-12 h-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-orange-300 dark:border-orange-600 flex items-center justify-center text-2xl font-bold text-orange-600 dark:text-orange-400 relative overflow-hidden"
                          animate={{
                            scale: [1, 1.05, 1],
                            boxShadow: [
                              "0 0 0 rgba(249, 115, 22, 0)",
                              "0 0 20px rgba(249, 115, 22, 0.5)",
                              "0 0 0 rgba(249, 115, 22, 0)"
                            ]
                          }}
                          transition={{
                            duration: 0.3,
                            repeat: isLotteryRunning ? Infinity : 0
                          }}
                        >
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{
                              y: isLotteryRunning ? [-20, 20] : [0, 0]
                            }}
                            transition={{
                              duration: 0.1,
                              repeat: isLotteryRunning ? Infinity : 0,
                              ease: "linear"
                            }}
                          >
                            {digit}
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Each digit will settle randomly...
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};