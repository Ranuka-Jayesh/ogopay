import React, { useState, useEffect, useMemo, useRef, useCallback, memo, useDeferredValue } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import Lenis from '@studio-freight/lenis';
import { Chatbot } from './Chatbot';
import { jsPDF } from 'jspdf';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar, 
  DollarSign, 
  X, 
  Lock, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Search,
  BarChart3,
  Activity,
  Info,
} from 'lucide-react';
import { isValidTrackingCode } from '../../utils/codeGenerator';

// Memoized Transaction Item Component for better performance
const TransactionItem = memo(({ 
  transaction, 
  formatCurrency, 
  index, 
  onSelect,
  enableAnimations
}: { 
  transaction: any; 
  formatCurrency: (amount: number) => string; 
  index: number;
  onSelect: (id: number) => void;
  isSelected: boolean;
  enableAnimations: boolean;
}) => (
  <motion.div
    initial={enableAnimations ? { opacity: 0, x: -20 } : {}}
    animate={enableAnimations ? { opacity: 1, x: 0 } : {}}
    exit={enableAnimations ? { opacity: 0, x: 20 } : {}}
    transition={enableAnimations ? { delay: 0.06 * index, duration: 0.25 } : {}}
    whileHover={enableAnimations ? { scale: 1.01, x: 3 } : {}}
    className={`flex items-center justify-between p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
      transaction.type === 'loan'
        ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:shadow-lg'
        : 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:shadow-lg'
    }`}
    onClick={() => onSelect(transaction.id)}
  >
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${
        transaction.type === 'loan'
          ? 'bg-blue-100 dark:bg-blue-800'
          : 'bg-green-100 dark:bg-green-800'
      }`}>
        {transaction.type === 'loan' ? (
          <ArrowUpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        ) : (
          <ArrowDownCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        )}
      </div>
      <div>
        <p className={`font-semibold text-lg ${
          transaction.type === 'loan'
            ? 'text-blue-900 dark:text-blue-100'
            : 'text-green-900 dark:text-green-100'
        }`}>
          {transaction.type === 'loan' ? 'Loan' : 'Repayment'}
        </p>
        {transaction.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {transaction.description}
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {new Date(transaction.transaction_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
    <div className={`text-2xl font-bold ${
      transaction.type === 'loan'
        ? 'text-blue-900 dark:text-blue-100'
        : 'text-green-900 dark:text-green-100'
    }`}>
      {formatCurrency(transaction.amount)}
    </div>
  </motion.div>
));

interface TrackingData {
  friend: {
    id: number;
    full_name: string;
    whatsapp_number: string;
    created_at: string;
    admin_id: string;
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
  adminCurrency: string;
}

interface TrackingPageProps {
  trackingUrl: string;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ trackingUrl }) => {
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [showCode, setShowCode] = useState(false);
  // App-level splash handles initial loading; no per-page splash here
  
  // Tab title and SEO (match LandingPage)
  useEffect(() => {
    const prev = document.title;
    const title = 'Ogo Pay — Smart Personal Lending Tracker | Loans, Repayments, PDF Statements';
    document.title = title;
    
    const upsert = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    upsert('description', 'Track loans and repayments securely with Ogo Pay. Share tracking links and export PDF statements.');
    upsert('keywords', 'Ogo Pay, tracking, personal lending, loan tracker, ogotechnology');
    
    const upsertOG = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    upsertOG('og:title', title);
    upsertOG('og:description', 'Track loans and repayments securely with Ogo Pay. Share tracking links and export PDF statements.');
    upsertOG('og:image', '/logo.jpg');
    
    // Favicon / apple-touch-icon
    const upsertLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) { link = document.createElement('link'); link.setAttribute('rel', rel); document.head.appendChild(link); }
      link.setAttribute('href', href);
    };
    upsertLink('icon', '/logo.jpg');
    upsertLink('apple-touch-icon', '/logo.jpg');
    
    // Twitter
    const upsertTwitter = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    upsertTwitter('twitter:card', 'summary_large_image');
    upsertTwitter('twitter:image', '/logo.jpg');
    
    return () => { document.title = prev; };
  }, []);
  
  // New interactive states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'loan' | 'repayment'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Invite message states
  const [showInviteMessage, setShowInviteMessage] = useState(false);
  const [] = useState(0);
  const [, setInviteAnimation] = useState(false);
  
  // Logout confirmation states
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Info popup states
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [adminDetails, setAdminDetails] = useState<{
    name: string;
    whatsapp_number: string;
    email: string;
  } | null>(null);
  
  // Scroll states
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Help center states
  const [, setShowHelpNotification] = useState(false);

  // Admin currency state
  const [adminCurrency, setAdminCurrency] = useState<string>('LKR');
  // Perf: detect when to disable heavy animations
  const enableAnimations = useMemo(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    // @ts-ignore deviceMemory is non-standard but widely supported on Chromium
    const deviceMemory = navigator.deviceMemory || 8;
    const cores = navigator.hardwareConcurrency || 8;
    const lowResources = deviceMemory <= 4 && cores <= 4;
    return !prefersReduced && !isMobile && !lowResources;
  }, []);
  // PDF generation progress state
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  // reserved for future toast; kept minimal to avoid unused state

  // Theme toggle
  const { isDark, toggleTheme } = useTheme();
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  const handleThemeToggle = useCallback(() => {
    setIsThemeTransitioning(true);
    requestAnimationFrame(() => {
      toggleTheme();
      setTimeout(() => setIsThemeTransitioning(false), 500);
    });
  }, [toggleTheme]);

  // Optimized currency formatting function with memoization
  const formatCurrency = useCallback((amount: number) => {
    const currencySymbols: { [key: string]: string } = {
      'LKR': 'Rs.',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹'
    };
    
    const symbol = currencySymbols[adminCurrency] || adminCurrency;
    return `${symbol}${amount.toFixed(2)}`;
  }, [adminCurrency]);

  // Motion values for interactive animations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  // Click outside handler for calendar
  useEffect(() => {
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

  // Optimized scroll event handler with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Show help notification after 3 seconds
    const helpTimer = setTimeout(() => {
      setShowHelpNotification(true);
    }, 3000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(helpTimer);
    };
  }, []);

  // Optimized Lenis smooth scrolling - only on desktop and with reduced motion support
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Only enable Lenis on desktop and if user doesn't prefer reduced motion
    let lenis: any = null;
    if (typeof window !== 'undefined' && window.innerWidth >= 768 && !prefersReducedMotion) {
      lenis = new Lenis({
        lerp: 0.06, // Reduced for better performance
        duration: 1.0, // Reduced duration
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.8, // Reduced wheel sensitivity
      });
      
      let rafId: number;
      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
      
    return () => {
        if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
    }
  }, []);

  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Help center functions




  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Find friend by tracking URL
        const { data: friendData, error: friendError } = await supabase
          .from('friends')
          .select('id, full_name, whatsapp_number, created_at, admin_id')
          .eq('tracking_url', trackingUrl)
          .single();

        if (friendError || !friendData) {
          setError('Tracking URL not found or invalid.');
          return;
        }

        // Fetch admin's currency preference and details
        const { data: adminData, error: adminError } = await supabase
          .from('users')
          .select('preferred_currency, full_name, whatsapp_number, email')
          .eq('id', friendData.admin_id)
          .single();

        if (adminError) {
          console.error('Error fetching admin currency:', adminError);
          // Default to LKR if error
          setAdminCurrency('LKR');
        } else {
          setAdminCurrency(adminData?.preferred_currency || 'LKR');
          // Store admin details for info popup
          setAdminDetails({
            name: adminData?.full_name || 'Unknown',
            whatsapp_number: adminData?.whatsapp_number || 'Unknown',
            email: adminData?.email || 'Unknown'
          });
        }

        // Store friend data for later use
        setData({
          friend: friendData,
          transactions: [],
          summary: {
            totalBorrowed: 0,
            totalRepaid: 0,
            remainingBalance: 0
          },
          adminCurrency: adminData?.preferred_currency || 'LKR'
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

  // Listen for admin currency changes
  useEffect(() => {
    if (!data?.friend?.admin_id) return;

    const channel = supabase
      .channel(`admin_currency_${data.friend.admin_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${data.friend.admin_id}`
        },
        (payload: { new: { preferred_currency?: string } | null }) => {
          if (payload.new && payload.new.preferred_currency) {
            const newCurrency = payload.new.preferred_currency;
            setAdminCurrency(newCurrency);
            setData(prev => prev ? { ...prev, adminCurrency: newCurrency } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [data?.friend?.admin_id]);

  // Optimized filtering and sorting with memoization
  const deferredSearch = useDeferredValue(searchTerm);
  const filteredAndSortedTransactions = useMemo(() => {
    if (!data?.transactions) return [];

    // Pre-compute search term for performance
    const searchLower = deferredSearch.toLowerCase();
    const hasSearch = deferredSearch.length > 0;
    const hasDateFilter = startDate || endDate;

    let filtered = data.transactions.filter(transaction => {
      // Text search - optimized
      if (hasSearch) {
        const matchesSearch = 
          transaction.description?.toLowerCase().includes(searchLower) ||
          transaction.type.toLowerCase().includes(searchLower) ||
          transaction.amount.toString().includes(deferredSearch);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filterType !== 'all' && transaction.type !== filterType) {
        return false;
      }

      // Date range filter - optimized
      if (hasDateFilter) {
        const transactionDate = new Date(transaction.transaction_date);
        
        if (startDate && endDate) {
          if (transactionDate < startDate || transactionDate > endDate) return false;
        } else if (startDate) {
          if (transactionDate < startDate) return false;
        } else if (endDate) {
          if (transactionDate > endDate) return false;
        }
      }

      return true;
    });

    // Optimized sorting with pre-computed values
    if (filtered.length > 0) {
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
            aValue = new Date(a.transaction_date).getTime();
            bValue = new Date(b.transaction_date).getTime();
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
            aValue = new Date(a.transaction_date).getTime();
            bValue = new Date(b.transaction_date).getTime();
        }

        return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
      });
    }

    return filtered;
  }, [data?.transactions, searchTerm, filterType, sortBy, sortOrder, startDate, endDate]);

  // Optimized calendar helper functions with memoization
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = useCallback((date: Date) => {
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
  }, []);

  const isDateInRange = useCallback((date: Date) => {
    if (!startDate && !endDate) return false;
    if (startDate && endDate) {
      return date >= startDate && date <= endDate;
    }
    if (startDate && hoverDate) {
      const min = startDate < hoverDate ? startDate : hoverDate;
      const max = startDate > hoverDate ? startDate : hoverDate;
      return date >= min && date <= max;
    }
    if (startDate) {
      return date >= startDate;
    }
    if (endDate) {
      return date <= endDate;
    }
    return false;
  }, [startDate, endDate, hoverDate]);

  const isDateSelected = useCallback((date: Date) => {
    if (startDate && endDate) {
      return date.getTime() === startDate.getTime() || date.getTime() === endDate.getTime();
    }
    return startDate && date.getTime() === startDate.getTime();
  }, [startDate, endDate]);

  const handleDateClick = useCallback((date: Date) => {
    if (!startDate || (startDate && endDate)) {
      // First click or reset selection
      setStartDate(date);
      setEndDate(null);
      setHoverDate(null);
    } else {
      // Second click - complete the range
      if (date > startDate) {
        setEndDate(date);
        setHoverDate(null);
      } else if (date < startDate) {
        // If second date is before first, swap them
        setEndDate(startDate);
        setStartDate(date);
        setHoverDate(null);
      } else {
        // Same date selected, treat as single date
        setEndDate(date);
        setHoverDate(null);
      }
    }
  }, [startDate, endDate]);

  const handleDateHover = useCallback((date: Date) => {
    if (startDate && !endDate) {
      setHoverDate(date);
    }
  }, [startDate, endDate]);

  const clearDateRange = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setHoverDate(null);
  }, []);

  const formatDateRange = useCallback(() => {
    if (startDate && endDate) {
      if (startDate.getTime() === endDate.getTime()) {
        return startDate.toLocaleDateString();
      }
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    } else if (startDate) {
      return `${startDate.toLocaleDateString()} - Select end date`;
    }
    return 'Select date range';
  }, [startDate, endDate]);

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }, [currentMonth]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Re-fetch friend data
      const { data: friendData, error: friendError } = await supabase
        .from('friends')
        .select('id, full_name, whatsapp_number, created_at, admin_id')
        .eq('tracking_url', trackingUrl)
        .single();

      if (friendError || !friendData) {
        console.error('Error refreshing friend data:', friendError);
        return;
      }

      // Re-fetch admin's currency preference
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('preferred_currency')
        .eq('id', friendData.admin_id)
        .single();

      if (adminError) {
        console.error('Error refreshing admin currency:', adminError);
      } else {
        setAdminCurrency(adminData?.preferred_currency || 'LKR');
      }

      // Re-fetch transaction data
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('friend_id', friendData.id)
        .order('transaction_date', { ascending: false });

      if (transactionsError) {
        console.error('Error refreshing transaction data:', transactionsError);
        return;
      }

      // Optimized summary calculation
      const summary = transactionsData?.reduce((acc: { totalBorrowed: number; totalRepaid: number; remainingBalance: number }, transaction: any) => {
        if (transaction.type === 'loan') {
          acc.totalBorrowed += transaction.amount;
        } else if (transaction.type === 'repayment') {
          acc.totalRepaid += transaction.amount;
        }
        return acc;
      }, { totalBorrowed: 0, totalRepaid: 0, remainingBalance: 0 }) || { totalBorrowed: 0, totalRepaid: 0, remainingBalance: 0 };

      summary.remainingBalance = summary.totalBorrowed - summary.totalRepaid;

      // Update state with fresh data
      setData({
        friend: friendData,
        transactions: transactionsData || [],
        summary,
        adminCurrency: adminData?.preferred_currency || 'LKR'
      });

      // Clear any filters or search terms
      setSearchTerm('');
      setFilterType('all');
      setStartDate(null);
      setEndDate(null);
      setSortBy('date');
      setSortOrder('desc');

    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [trackingUrl]);

  const handleLogout = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const confirmLogout = useCallback(() => {
    setShowLogoutConfirm(false);
    setIsCodeValid(false);
    setCode('');
    setData(null);
  }, []);

  const generatePDF = useCallback(async () => {
    setIsGeneratingPdf(true);
    setPdfProgress(5);
    // Fetch complete transaction data directly from database to ensure all records are included
    let completeTransactions: any[] = [];
    let completeSummary = { totalBorrowed: 0, totalRepaid: 0, remainingBalance: 0 };
    
    try {
      if (data?.friend?.id) {
        // Fetch all transactions for this friend from database
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('friend_id', data.friend.id)
          .order('transaction_date', { ascending: false });

        if (transactionsError) {
          console.error('Error fetching transactions for PDF:', transactionsError);
        } else {
          completeTransactions = transactionsData || [];
          setPdfProgress(20);
          
          // Calculate complete summary from all transactions
          completeSummary = completeTransactions.reduce((acc: { totalBorrowed: number; totalRepaid: number; remainingBalance: number }, transaction: any) => {
            if (transaction.type === 'loan') {
              acc.totalBorrowed += transaction.amount;
            } else if (transaction.type === 'repayment') {
              acc.totalRepaid += transaction.amount;
            }
            return acc;
          }, { totalBorrowed: 0, totalRepaid: 0, remainingBalance: 0 });
          
          completeSummary.remainingBalance = completeSummary.totalBorrowed - completeSummary.totalRepaid;
        }
      }
    } catch (error) {
      console.error('Error fetching complete transaction data for PDF:', error);
    }

    // Fallback to in-memory transactions if DB fetch returned none
    if (completeTransactions.length === 0 && data?.transactions?.length) {
      completeTransactions = data.transactions as any[];
      completeSummary = completeTransactions.reduce((acc: any, t: any) => {
        if (t.type === 'loan') acc.totalBorrowed += t.amount;
        else if (t.type === 'repayment') acc.totalRepaid += t.amount;
        return acc;
      }, { totalBorrowed: 0, totalRepaid: 0, remainingBalance: 0 });
      completeSummary.remainingBalance = completeSummary.totalBorrowed - completeSummary.totalRepaid;
    }

    // Create PDF content using jsPDF (A4 portrait, pt units)
    const pdf = new jsPDF('p', 'pt', 'a4');
    setPdfProgress(35);
    
    // Page metrics and header
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginX = 40;
    let cursorY = 60;

    const brand = { r: 16, g: 185, b: 129 };
    const gray = (v: number) => ({ r: v, g: v, b: v });

    // Header bar
    pdf.setFillColor(brand.r, brand.g, brand.b);
    pdf.rect(0, 0, pageWidth, 6, 'F');

    // Header text
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brand.r, brand.g, brand.b);
    pdf.setFontSize(22);
    pdf.text('OgoPay', marginX, cursorY);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text('Transaction Statement', marginX, cursorY + 18);
    pdf.setTextColor(gray(110).r, gray(110).g, gray(110).b);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageWidth - marginX, cursorY, { align: 'right' });
    cursorY += 32;
    setPdfProgress(45);
    
    // Parties box
    pdf.setDrawColor(225, 225, 225);
    pdf.roundedRect(marginX - 5, cursorY, pageWidth - marginX * 2 + 10, 60, 6, 6, 'S');
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Lender', marginX + 10, cursorY + 18);
    pdf.text('Borrower', pageWidth / 2 + 10, cursorY + 18);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    pdf.text(`${adminDetails?.name || 'Admin'}`, marginX + 10, cursorY + 36);
    pdf.text(`${data?.friend.full_name || 'N/A'}`, pageWidth / 2 + 10, cursorY + 36);
    const memberSince = new Date(data?.friend.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    pdf.text(`Currency: ${adminCurrency}`, marginX + 10, cursorY + 54);
    pdf.text(`Member since: ${memberSince}`, pageWidth / 2 + 10, cursorY + 54);
    cursorY += 80;
    setPdfProgress(55);
    
    // Summary band
    pdf.setFillColor(247, 250, 252);
    pdf.roundedRect(marginX - 5, cursorY, pageWidth - marginX * 2 + 10, 66, 6, 6, 'F');
    pdf.setDrawColor(230, 230, 230);
    pdf.roundedRect(marginX - 5, cursorY, pageWidth - marginX * 2 + 10, 66, 6, 6, 'S');
    pdf.setTextColor(80, 80, 80);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Summary', marginX, cursorY + 18);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(`Total Borrowed: ${formatCurrency(completeSummary.totalBorrowed)}`, marginX, cursorY + 40);
    pdf.text(`Total Repaid: ${formatCurrency(completeSummary.totalRepaid)}`, pageWidth / 2, cursorY + 40);
    setPdfProgress(60);
    const remainingBalance = completeSummary.remainingBalance;
    const remColor = remainingBalance > 0 ? { r: 220, g: 38, b: 38 } : { r: 22, g: 163, b: 74 };
    pdf.setTextColor(remColor.r, remColor.g, remColor.b);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Remaining: ${formatCurrency(remainingBalance)}`, marginX, cursorY + 58);
    cursorY += 86;
    setPdfProgress(65);
    
    // Transactions section - Formal Table Format
    // Table header helper and title
    const drawTableHeader = (y: number) => {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(marginX - 5, y - 18, pageWidth - marginX * 2 + 10, 24, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(11);
      pdf.text('Date', marginX, y);
      pdf.text('Type', marginX + 120, y);
      pdf.text('Amount', marginX + 200, y);
      pdf.text('Description', marginX + 320, y);
      pdf.setDrawColor(220, 220, 220);
      pdf.line(marginX - 5, y + 6, pageWidth - marginX + 5, y + 6);
      // add extra breathing room below header
      return y + 18;
    };
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(13);
    pdf.text('Transaction History', marginX, cursorY);
    // push the section a bit further down and add more space below header
    cursorY = drawTableHeader(cursorY + 38);
    setPdfProgress(70);
    let yPosition = cursorY;
    let pageNumber = 1;
    const transactions = completeTransactions;
    const dateColX = marginX;
    const typeColX = marginX + 120;
    const amountRightX = marginX + 280;
    const descColX = marginX + 320;
    const rowHeight = 22; // more generous row height for clarity
    
    if (transactions.length === 0) {
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text('No transactions found for this period.', 20, yPosition);
      yPosition += 20;
    } else {
      // Draw table rows
      transactions.forEach((transaction: any, index: number) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 120) {
          pdf.addPage();
          pageNumber++;
          // New page header
          pdf.setFillColor(brand.r, brand.g, brand.b);
          pdf.rect(0, 0, pageWidth, 6, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(brand.r, brand.g, brand.b);
          pdf.setFontSize(18);
          pdf.text('OgoPay', marginX, 36);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(10);
          pdf.text(`Transaction Statement — Page ${pageNumber}`, pageWidth - marginX, 36, { align: 'right' });
          yPosition = drawTableHeader(66);
        }
        
        // Zebra background for clarity
        if (index % 2 === 0) {
          pdf.setFillColor(248, 249, 251);
          pdf.rect(marginX - 5, yPosition - 12, pageWidth - marginX * 2 + 10, rowHeight - 4, 'F');
        }

        // Row data
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        const dateStr = new Date(transaction.transaction_date || transaction.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        pdf.text(dateStr, dateColX, yPosition);
        const transactionType = transaction.type === 'loan' ? 'LOAN' : 'REPAYMENT';
        pdf.text(transactionType, typeColX, yPosition);
        const amountNum = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
        const amountText = formatCurrency(Number.isFinite(amountNum) ? amountNum : 0);
        const amtWidth = pdf.getTextWidth(amountText);
        pdf.text(amountText, amountRightX - amtWidth, yPosition);
        const description = transaction.description || '-';
        const maxDescLength = 60;
        const displayDesc = description.length > maxDescLength ? (description.substring(0, maxDescLength - 1) + '…') : description;
        pdf.text(displayDesc, descColX, yPosition);
        // separator
        pdf.setDrawColor(225, 225, 225);
      pdf.setLineWidth(0.5);
        pdf.line(marginX - 5, yPosition + 9, pageWidth - marginX + 5, yPosition + 9);
        yPosition += rowHeight;
        // Update progress proportionally (70 -> 95)
        const base = 70;
        const range = 25;
        const pct = base + Math.min(range, Math.floor(((index + 1) / transactions.length) * range));
        setPdfProgress(pct);
      });
    }
    
    // Footer on each page
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setDrawColor(220, 220, 220);
      pdf.line(marginX - 5, pageHeight - 50, pageWidth - marginX + 5, pageHeight - 50);
      pdf.setFontSize(9);
      pdf.setTextColor(110, 110, 110);
      pdf.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, marginX, pageHeight - 34);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ogopay.com', pageWidth / 2 - 20, pageHeight - 34);
      pdf.setFont('helvetica', 'normal');
      pdf.text('• OgoTechnology', pageWidth / 2 + 34, pageHeight - 34);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 34, { align: 'right' });
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const fileName = `${data?.friend.full_name || 'transaction'}_statement_${timestamp}.pdf`;
    
    // Download the PDF
    pdf.save(fileName);
    setPdfProgress(100);
    setTimeout(() => setIsGeneratingPdf(false), 300);
  }, [data, formatCurrency]);

  const handleDownload = useCallback(async () => {
    // PDF download logic
    await generatePDF();
  }, []);

  const validateAndSubmitCode = useCallback(async (enteredCode: string) => {
    setCodeError(''); // Clear previous errors
    if (!isValidTrackingCode(enteredCode)) {
      setCodeError('Please enter a valid 4-digit code.');
      return;
    }

    try {
      const { data: friendData, error: friendError } = await supabase
        .from('friends')
        .select('*')
        .eq('tracking_url', trackingUrl)
        .eq('tracking_code', enteredCode)
        .single();

      if (friendError || !friendData) {
        setCodeError('Invalid code. Please try again.');
        return;
      }

      // Code is valid, fetch transaction data
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('friend_id', friendData.id)
        .order('transaction_date', { ascending: false });

      if (transactionsError) {
        setError('Failed to load transaction history.');
        return;
      }

      // Fetch admin's currency preference and details
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('preferred_currency, full_name, whatsapp_number, email')
        .eq('id', friendData.admin_id)
        .single();

      if (adminError) {
        console.error('Error fetching admin currency:', adminError);
      } else {
        // Store admin details for info popup
        setAdminDetails({
          name: adminData?.full_name || 'Unknown',
          whatsapp_number: adminData?.whatsapp_number || 'Unknown',
          email: adminData?.email || 'Unknown'
        });
      }

      // Optimized summary calculation
      const summary = transactionsData?.reduce((acc: { totalBorrowed: number; totalRepaid: number; remainingBalance: number }, transaction: any) => {
        if (transaction.type === 'loan') {
          acc.totalBorrowed += transaction.amount;
        } else if (transaction.type === 'repayment') {
          acc.totalRepaid += transaction.amount;
        }
        return acc;
      }, { totalBorrowed: 0, totalRepaid: 0, remainingBalance: 0 }) || { totalBorrowed: 0, totalRepaid: 0, remainingBalance: 0 };

      summary.remainingBalance = summary.totalBorrowed - summary.totalRepaid;

      setData({
        friend: friendData,
        transactions: transactionsData || [],
        summary,
        adminCurrency: adminData?.preferred_currency || 'LKR'
      });

      setIsCodeValid(true);
      
      // Show invite message after successful login
      setTimeout(() => {
        setShowInviteMessage(true);
        setInviteAnimation(true);
      }, 2000);
    } catch (err) {
      setCodeError('An error occurred. Please try again.');
      console.error('Code verification error:', err);
    }
  }, [trackingUrl]);

  // No additional splash here; App-level controls the single splash

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-100 dark:from-secondary-900 dark:to-secondary-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-100 dark:from-secondary-900 dark:to-secondary-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!isCodeValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-100 dark:from-secondary-900 dark:to-secondary-800 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
        <motion.div 
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200/30 to-blue-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-blue-200/20 rounded-full blur-3xl"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 20,
            duration: 0.6
          }}
          className="relative bg-white/95 dark:bg-secondary-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-white/30 dark:border-secondary-600/30"
          style={{
            transformStyle: "preserve-3d",
            perspective: "1000px"
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            mouseX.set(e.clientX - centerX);
            mouseY.set(e.clientY - centerY);
          }}
          onMouseLeave={() => {
            mouseX.set(0);
            mouseY.set(0);
          }}
        >
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d"
            }}
            className="text-center mb-8"
          >
            <motion.div 
                className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
                <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
            </motion.div>
            <motion.h2 
                className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3"
              initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Enter Access Code
            </motion.h2>
            <motion.p 
              className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Please enter the 4-digit code to view transaction history
            </motion.p>
          </motion.div>

          <div className="space-y-6">
              <div className="relative">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <input
                  type={showCode ? "text" : "password"}
                  id="code"
                  value={code}
                  onChange={(e) => {
                    const newCode = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setCode(newCode);
                    
                    // Auto-submit when 4 digits are entered
                    if (newCode.length === 4) {
                      // Validate and submit automatically
                      validateAndSubmitCode(newCode);
                    }
                  }}
                  className="w-full px-6 py-4 border-2 border-gray-200 dark:border-secondary-600 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 bg-white dark:bg-secondary-700 text-gray-900 dark:text-white text-center text-xl font-mono tracking-widest transition-all duration-300 hover:border-green-300 dark:hover:border-green-500"
                  placeholder="0000"
                  maxLength={4}
                  required
                />
                <motion.button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </motion.button>
              </motion.div>
              
              {/* Code input progress indicator */}
              <div className="flex justify-center space-x-2 mt-4">
                {[0, 1, 2, 3].map((index) => (
                  <motion.div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index < code.length 
                          ? 'bg-green-500 scale-110' 
                        : 'bg-gray-200 dark:bg-secondary-600'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: index < code.length ? 1 : 0.8 }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence>
            {codeError && (
                <motion.div 
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4"
                >
                  <div className="flex items-start space-x-3">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                      className="flex-shrink-0 mt-0.5"
                    >
                      <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-red-700 dark:text-red-400 font-medium mb-2">
                        {codeError}
                      </p>
                      <p className="text-red-600 dark:text-red-500 text-sm">
                        If you're having trouble accessing your account, please contact your lender directly.
                      </p>
              </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter the 4-digit code to automatically view your transaction history
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show transaction history after code validation
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(34, 197, 94, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(34, 197, 94, 0.2);
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.9));
            border-radius: 10px;
            border: 1px solid rgba(34, 197, 94, 0.3);
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 1));
            box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
            transform: scale(1.05);
          }
          
          .custom-scrollbar::-webkit-scrollbar-corner {
            background: transparent;
          }
          
          /* Firefox scrollbar */
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(34, 197, 94, 0.8) rgba(34, 197, 94, 0.1);
          }
        `
      }} />
      <motion.div 
        className="min-h-screen relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          transition: 'background 0.8s ease',
          background: isDark
            ? 'linear-gradient(135deg, #0b1220, #0e1a2a)'
            : 'linear-gradient(135deg, #f7fafc 0%, #eefdf4 100%)'
        }}
      >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          {...(enableAnimations ? {} : { animate: undefined, transition: undefined })}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl ${
            isDark 
              ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30' 
              : 'bg-gradient-to-br from-emerald-200/30 to-blue-200/30'
          }`}
        />
        <motion.div
          {...(enableAnimations ? {} : { animate: undefined, transition: undefined })}
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [180, 90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl ${
            isDark 
              ? 'bg-gradient-to-br from-emerald-900/30 to-blue-900/30' 
              : 'bg-gradient-to-br from-emerald-200/30 to-blue-200/30'
          }`}
        />
      </div>

      {/* Theme change overlay */}
      <AnimatePresence>
        {isThemeTransitioning && (
          <motion.div
            key="theme-overlay"
            className="pointer-events-none fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            style={{
              background: isDark
                ? 'radial-gradient(1200px 800px at 50% 50%, rgba(255,255,255,0.08), transparent 60%)'
                : 'radial-gradient(1200px 800px at 50% 50%, rgba(16,185,129,0.10), transparent 60%)'
            }}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white/98 dark:bg-secondary-800/95 rounded-3xl shadow-xl border border-gray-200/80 dark:border-secondary-600/40 overflow-hidden"
          style={{
            transition: 'background-color 0.5s ease, border-color 0.5s ease'
          }}
        >
          {/* Theme-based Background Animation */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isDark ? 0.3 : 0.1 }}
            transition={{ duration: 0.8 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${
              isDark 
                ? 'from-blue-900/20 via-purple-900/20 to-indigo-900/20' 
                : 'from-blue-50/30 via-purple-50/30 to-indigo-50/30'
            }`} />
          </motion.div>

          {/* Green Glassmorphism Profile Card */}
          <div className="py-8 px-8 bg-white dark:bg-green-600/20 rounded-3xl shadow-sm border border-emerald-200/60 dark:border-green-400/30 relative overflow-hidden mb-8">
            {/* Glassmorphism Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-white/40 dark:bg-green-500/10 rounded-3xl"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[length:18px_18px]"></div>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
              {/* Profile Details on Left Side */}
              <motion.div 
                className="flex items-center gap-6 order-2 lg:order-1"
                initial={{ opacity: 0, x: -50, y: 30 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 100 }}
              >
                {/* Profile Information */}
                <div className="space-y-2">
                  <motion.h1 
                    className="text-3xl font-bold text-emerald-700 dark:text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                  >
                    Lending Tracking Details
                  </motion.h1>

                  {/* Status Badges */}
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 dark:bg-white/20 dark:border-white/30 dark:text-white">
                      <span className="text-sm font-medium">Active</span>
                    </div>
                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200 dark:bg-white/20 dark:border-white/30 dark:text-white">
                      <span className="text-sm font-medium">Member</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Small Circular Action Buttons */}
              <motion.div 
                className="flex items-center gap-4 order-1 lg:order-2"
                initial={{ opacity: 0, x: 50, y: 30 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 100 }}
              >
                {/* Info Button */}
                <motion.button
                  onClick={() => setShowInfoPopup(true)}
                  className="group relative w-14 h-14 rounded-full bg-gray-800/20 dark:bg-white/15 backdrop-blur-xl border border-gray-300/50 dark:border-white/25 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800/30 dark:hover:bg-white/25 flex items-center justify-center"
                  whileHover={{ 
                    scale: 1.08, 
                    y: -4
                  }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="relative">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors duration-200" />
                        {/* Glow Effect */}
                        <motion.div
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.2, 0.5, 0.2],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                      className="absolute inset-0 rounded-full bg-blue-400/30 blur-md"
                        />
                  </div>
                  
                  {/* Button Label */}
                      <motion.div
                    className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-800 dark:text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ y: 8 }}
                    whileHover={{ y: 0 }}
                  >
                    Info
                  </motion.div>
                </motion.button>

                {/* Download PDF Button */}
                <motion.button
                  onClick={handleDownload}
                  className="group relative w-14 h-14 rounded-full bg-gray-800/20 dark:bg-white/15 backdrop-blur-xl border border-gray-300/50 dark:border-white/25 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800/30 dark:hover:bg-white/25 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isGeneratingPdf}
                                      whileHover={{ 
                    scale: 1.08, 
                    y: -4
                    }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="relative">
                    {isGeneratingPdf ? (
                      <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    ) : (
                    <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    )}
                        {/* Glow Effect */}
                        <motion.div
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.2, 0.5, 0.2],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                      className="absolute inset-0 rounded-full bg-emerald-400/30 blur-md"
                        />
                  </div>
                  
                  {/* Button Label */}
                  <motion.div
                    className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-800 dark:text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ y: 8 }}
                    whileHover={{ y: 0 }}
                  >
                    {isGeneratingPdf ? `${pdfProgress}%` : 'PDF'}
                  </motion.div>
                </motion.button>

                {/* Refresh Data Button */}
                <motion.button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="group relative w-14 h-14 rounded-full bg-gray-800/20 dark:bg-white/15 backdrop-blur-xl border border-gray-300/50 dark:border-white/25 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800/30 dark:hover:bg-white/25 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ 
                    scale: 1.08, 
                    y: -4
                  }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div
                    animate={isRefreshing ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
                    className="relative"
                  >
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {/* Glow Effect */}
                    <motion.div
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.2, 0.5, 0.2],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 rounded-full bg-blue-400/30 blur-md"
                    />
                  </motion.div>
                  
                  {/* Button Label */}
                  <motion.div
                    className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-800 dark:text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ y: 8 }}
                    whileHover={{ y: 0 }}
                  >
                    {isRefreshing ? '...' : 'Refresh'}
                  </motion.div>
                </motion.button>

                {/* Theme Toggle Button */}
                <motion.button
                  onClick={handleThemeToggle}
                  className="group relative w-14 h-14 rounded-full bg-gray-800/20 dark:bg-white/15 backdrop-blur-xl border border-gray-300/50 dark:border-white/25 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800/30 dark:hover:bg-white/25 flex items-center justify-center"
                  whileHover={{ 
                    scale: 1.08, 
                    y: -4
                  }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <AnimatePresence mode="wait">
                    {!isDark ? (
                      <motion.div
                        key="sun"
                        initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                        transition={{ duration: 0.35, type: 'spring', stiffness: 260, damping: 18 }}
                        className="relative"
                      >
                        <svg className="h-5 w-5 text-amber-500 group-hover:text-amber-600 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                    </svg>
                        <motion.span
                          className="absolute inset-0 rounded-full"
                          initial={{ scale: 0.8, opacity: 0.2 }}
                          animate={{ scale: [1, 1.35, 1], opacity: [0.2, 0.45, 0.2] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.35), transparent 60%)' }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
                        transition={{ duration: 0.35, type: 'spring', stiffness: 260, damping: 18 }}
                        className="relative"
                      >
                        <svg className="h-5 w-5 text-slate-200 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                        </svg>
                        <motion.span
                          className="absolute inset-0 rounded-full"
                          initial={{ scale: 0.8, opacity: 0.15 }}
                          animate={{ scale: [1, 1.35, 1], opacity: [0.15, 0.3, 0.15] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ background: 'radial-gradient(circle, rgba(148,163,184,0.35), transparent 60%)' }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Button Label */}
                  <motion.div
                    className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-800 dark:text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ y: 8 }}
                    whileHover={{ y: 0 }}
                  >
                    {isDark ? 'Light' : 'Dark'}
                  </motion.div>
                </motion.button>

                {/* Logout Button */}
                <motion.button
                  onClick={handleLogout}
                  className="group relative w-14 h-14 rounded-full bg-gray-800/20 dark:bg-white/15 backdrop-blur-xl border border-gray-300/50 dark:border-white/25 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800/30 dark:hover:bg-white/25 flex items-center justify-center"
                                      whileHover={{ 
                    scale: 1.08, 
                    y: -4
                    }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="relative">
                    <svg className="h-5 w-5 text-red-600 dark:text-red-400 group-hover:text-red-500 dark:group-hover:text-red-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {/* Glow Effect */}
                    <motion.div
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.2, 0.5, 0.2],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 rounded-full bg-red-400/30 blur-md"
                    />
                  </div>
                  
                  {/* Button Label */}
                  <motion.div
                    className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-800 dark:text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ y: 8 }}
                    whileHover={{ y: 0 }}
                  >
                    Logout
                  </motion.div>
                </motion.button>
              </motion.div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-8">
            {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-6 border border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <ArrowUpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Total Borrowed</h3>
              </div>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(data?.summary.totalBorrowed || 0)}
              </p>
              <div className="mt-2 flex items-center text-blue-600 dark:text-blue-400 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Total loans given</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl p-6 border border-green-200 dark:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                <ArrowDownCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">Total Repaid</h3>
              </div>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(data?.summary.totalRepaid || 0)}
              </p>
              <div className="mt-2 flex items-center text-green-600 dark:text-green-400 text-sm">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span>Total repayments</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 ${
                (data?.summary.remainingBalance || 0) > 0
                  ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-700'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  (data?.summary.remainingBalance || 0) > 0
                    ? 'bg-red-100 dark:bg-red-800'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                <DollarSign className={`h-5 w-5 ${
                  (data?.summary.remainingBalance || 0) > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`} />
                </div>
                <h3 className={`font-semibold ${
                  (data?.summary.remainingBalance || 0) > 0
                    ? 'text-red-900 dark:text-red-100'
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Remaining Balance
                </h3>
              </div>
              <p className={`text-3xl font-bold ${
                (data?.summary.remainingBalance || 0) > 0
                  ? 'text-red-900 dark:text-red-100'
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {formatCurrency(data?.summary.remainingBalance || 0)}
              </p>
              <div className={`mt-2 flex items-center text-sm ${
                (data?.summary.remainingBalance || 0) > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                <Activity className="h-4 w-4 mr-1" />
                <span>{(data?.summary.remainingBalance || 0) > 0 ? 'Outstanding amount' : 'All settled'}</span>
              </div>
            </motion.div>
          </div>

          {/* Transaction Chart Section */}
          <motion.div 
            className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-secondary-700/50 dark:to-blue-900/20 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-secondary-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                        animate={{ width: `${Math.min((data?.summary.totalBorrowed || 0) / Math.max(data?.summary.totalBorrowed || 1, data?.summary.totalRepaid || 1) * 100, 100)}%` }}
                        transition={{ delay: 0.8, duration: 1 }}
                      />
              </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                      {formatCurrency(data?.summary.totalBorrowed || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-16">Repaid</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                      <motion.div 
                        className="bg-green-500 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((data?.summary.totalRepaid || 0) / Math.max(data?.summary.totalBorrowed || 1, data?.summary.totalRepaid || 1) * 100, 100)}%` }}
                        transition={{ delay: 0.9, duration: 1 }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                      {formatCurrency(data?.summary.totalRepaid || 0)}
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
                      {data?.summary.totalBorrowed ? Math.round((data?.summary.totalRepaid || 0) / data?.summary.totalBorrowed * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${data?.summary.totalBorrowed ? Math.min((data?.summary.totalRepaid || 0) / data?.summary.totalBorrowed * 100, 100) : 0}%` }}
                      transition={{ delay: 1, duration: 1 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-secondary-700 rounded-xl p-3 border border-gray-200 dark:border-secondary-600 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Transactions</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {data?.transactions.length || 0}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-secondary-700 rounded-xl p-3 border border-gray-200 dark:border-secondary-600 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Amount</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(data?.transactions.length ? (data?.summary.totalBorrowed / data?.transactions.length) : 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Interactive Controls */}
          <motion.div 
            className="bg-gray-50 dark:bg-secondary-700/50 rounded-2xl p-6 mb-8"
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-secondary-600">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'type')}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="type">Type</option>
                </select>
              </div>

              <motion.button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {sortOrder === 'asc' ? (
                  <>
                    <span className="text-sm sm:text-base">Oldest First</span>
                    <motion.div
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm sm:text-base"
                    >
                      ↑
                    </motion.div>
                  </>
                ) : (
                  <>
                    <span className="text-sm sm:text-base">Newest First</span>
                    <motion.div
                      animate={{ rotate: 180 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm sm:text-base"
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Clear all filters
              </motion.button>
            )}
          </motion.div>

          {/* Transaction History */}
          <div className="space-y-4">
            <motion.div 
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction History</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredAndSortedTransactions.length} transaction{filteredAndSortedTransactions.length !== 1 ? 's' : ''}
              </span>
            </motion.div>
            
            {filteredAndSortedTransactions.length === 0 ? (
              <motion.div 
                className="text-center py-12 text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
              >
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium">No transactions found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredAndSortedTransactions.slice(0, 50).map((transaction, index) => (
                    <TransactionItem
                    key={transaction.id}
                      transaction={transaction}
                      formatCurrency={formatCurrency}
                      index={index}
                      onSelect={(id) => setSelectedTransaction(selectedTransaction === id ? null : id)}
                      isSelected={selectedTransaction === transaction.id}
                      enableAnimations={enableAnimations}
                    />
                ))}
                </AnimatePresence>
                {filteredAndSortedTransactions.length > 50 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p>Showing first 50 transactions</p>
                    <p className="text-sm">Use filters to narrow down results</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </motion.div>
      </div>

      {/* Interactive Invite Message */}
      <AnimatePresence>
        {showInviteMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowInviteMessage(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-lg w-full bg-white dark:bg-secondary-800 rounded-2xl shadow-xl border border-gray-200 dark:border-secondary-600 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle Background */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-10 -right-10 w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full blur-xl"
                />
                <motion.div
                  animate={{
                    scale: [1.1, 1, 1.1],
                  }}
                  transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -bottom-10 -left-10 w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full blur-xl"
                />
              </div>

              {/* Content */}
              <div className="relative z-10 p-6">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-12 h-12 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl font-semibold text-green-600 dark:text-green-400 mb-3"
                  >
                    Welcome to OgoPay
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm text-gray-600 dark:text-gray-300 mb-4"
                  >
                    Experience the full power of our financial management platform.
                  </motion.p>
                </motion.div>

                                {/* Key Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-3 mb-6"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Create a Friend Profile - Quick setup to begin tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Log Transactions - Add money lent or repaid</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Real-Time Tracking - See balances and history at a glance</span>
                  </div>
                </motion.div>

                                {/* Call to Action */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="text-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open('https://ogopay.com', '_blank')}
                    className="bg-green-600 dark:bg-green-500 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Join Platform</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </motion.button>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-xs text-gray-500 dark:text-gray-400 mt-3"
                  >
                    Experience the full platform today
                  </motion.p>
                </motion.div>

                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 }}
                  onClick={() => setShowInviteMessage(false)}
                  className="absolute top-3 right-3 w-6 h-6 bg-gray-100 dark:bg-secondary-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-secondary-600 transition-colors duration-200"
                >
                  <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Popup */}
      <AnimatePresence>
        {showInfoPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowInfoPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-lg w-full bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-secondary-600 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 text-center border-b border-gray-200 dark:border-secondary-600 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Info className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </motion.div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Link Owner Details
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Information about the person who created this tracking link
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Admin Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-secondary-600 pb-2">
                    Admin Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">N</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {adminDetails?.name || 'Not available'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">W</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp Number</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {adminDetails?.whatsapp_number || 'Not available'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">E</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {adminDetails?.email || 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Friend Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-secondary-600 pb-2">
                    Friend Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">N</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {data?.friend.full_name || 'Not available'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-teal-100 dark:bg-teal-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-teal-600 dark:text-teal-400">W</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp Number</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {data?.friend.whatsapp_number || 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-secondary-600 bg-gray-50 dark:bg-secondary-700/50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowInfoPopup(false)}
                  className="w-full px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Popup */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-md w-full bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-secondary-600 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 text-center border-b border-gray-200 dark:border-secondary-600">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </motion.div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Confirm Logout
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Are you sure you want to logout? You'll need to enter the access code again to view this tracking page.
                </p>
              </div>

              {/* Actions */}
              <div className="p-6 flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-secondary-600 transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-3 bg-red-600 dark:bg-red-500 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-200"
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>





      {/* Chatbot Component */}
      <Chatbot 
        showFloatingButton={true}
        position="bottom-left"
        customMessage="Need help with your transaction history? I'm here to assist you!"
      />

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-600 dark:bg-green-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group"
            whileHover={{ 
              scale: 1.1, 
              y: -3,
              rotate: [0, -10, 10, 0]
            }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="relative flex items-center justify-center w-full h-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              
              {/* Perfect Circle Glow Effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full bg-green-400/30 blur-sm"
              />
              
              {/* Perfect Circle Pulse Ring */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full border border-green-400/50"
              />
              
              {/* Additional Perfect Circle Ring */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute inset-0 rounded-full border border-green-400/30"
              />
            </div>
            
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              Back to Top
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
}; 