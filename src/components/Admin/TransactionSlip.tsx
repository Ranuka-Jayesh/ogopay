import React, { useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Calendar, FileText, CheckCircle2, Hash } from 'lucide-react';
import { Transaction, Friend } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface TransactionSlipProps {
  transaction: Transaction;
  friend: Friend;
  onClose: () => void;
}

export const TransactionSlip: React.FC<TransactionSlipProps> = ({ transaction, friend, onClose }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const slipRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Currency formatting function
  const formatCurrency = useCallback((amount: number) => {
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
  }, [user?.preferred_currency]);

  // Generate PNG from slip
  const generatePNG = useCallback(async () => {
    if (!slipRef.current) return null;
    
    setIsGenerating(true);
    
    try {
      // Ensure web fonts are ready before rendering to canvas for consistent alignment
      try {
        // @ts-ignore - document.fonts may not exist in older browsers
        if (document.fonts && typeof document.fonts.ready?.then === 'function') {
          // @ts-ignore
          await document.fonts.ready;
        }
      } catch {}
      // Use html2canvas to capture the slip as PNG
      const html2canvas = (await import('html2canvas')).default;
      const element = slipRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: isDark ? '#0B0E11' : '#ffffff',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating PNG:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isDark]);

  // Download PNG
  const handleDownload = useCallback(async () => {
    const pngData = await generatePNG();
    if (!pngData) return;

    const link = document.createElement('a');
    link.download = `ogopay_slip_${transaction.id}_${new Date().getTime()}.png`;
    link.href = pngData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatePNG, transaction.id]);

  // Share PNG
  const handleShare = useCallback(async () => {
    const pngData = await generatePNG();
    if (!pngData) return;

    setIsSharing(true);
    
    try {
      // Convert base64 to blob
      const response = await fetch(pngData);
      const blob = await response.blob();
      
      const file = new File([blob], `ogopay_slip_${transaction.id}.png`, { type: 'image/png' });
      
      // Share with file support (mobile targets like WhatsApp)
      // TS: navigator.canShare typing varies across platforms; runtime-guarded
      const canShareWithFiles = (() => {
        try {
          // @ts-ignore
          return typeof navigator.canShare === 'function' ? navigator.canShare({ files: [file] }) : false;
        } catch {
          return false;
        }
      })();
      if (navigator.share && canShareWithFiles) {
        await navigator.share({
          title: `OgoPay Transaction Slip - ${friend.name}`,
          text: `${transaction.type === 'loan' ? 'Loan' : 'Repayment'} of ${formatCurrency(transaction.amount)}`,
          files: [file]
        });
      } else {
        // Fallback: download the file
        handleDownload();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: download the file
      handleDownload();
    } finally {
      setIsSharing(false);
    }
  }, [generatePNG, transaction, friend.name, formatCurrency, handleDownload]);

  const isLoan = transaction.type === 'loan';
  const transactionDate = new Date(transaction.date);

  const palette = useMemo(() => ({
    bg: isDark ? 'bg-[#0B0E11]' : 'bg-white',
    card: isDark ? 'bg-[#11151B] border-[#1E2329]' : 'bg-white border-gray-200',
    textPrimary: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    divider: isDark ? 'border-[#1E2329]' : 'border-gray-200',
    accent: 'text-[#F0B90B]',
    accentBg: 'bg-[#F0B90B]',
    success: 'text-[#0ECB81]',
    danger: 'text-[#F6465D]'
  }), [isDark]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`rounded-2xl shadow-2xl w-full max-w-[700px] overflow-hidden ${palette.bg} max-h-[90vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-6 rounded-sm ${palette.accentBg}`} />
                <h3 className={`text-lg font-semibold tracking-wide ${palette.textPrimary}`}>OgoPay Receipt</h3>
              </div>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                aria-label="Close"
              >
                <X className={`h-5 w-5 ${palette.textSecondary}`} />
              </button>
            </div>
          </div>

          {/* Slip Content */}
          <div className="p-6">
            {/* Slip Preview */}
            <div
              ref={slipRef}
              className={`rounded-xl ${palette.card} border mx-auto mb-3 shadow-sm w-full`}
              style={{ maxWidth: 420 }}
            >
              {/* Brand bar */}
              <div className={`h-1 w-full ${palette.accentBg} rounded-t-xl`} />

              <div className="p-4">
                {/* Top row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center" style={{ height: 20 }}>
                    <FileText className={`${palette.accent}`} style={{ width: 16, height: 16, marginRight: 6, color: isDark ? '#FFFFFF' : undefined }} />
                    <span className={`${palette.textSecondary}`} style={{ fontSize: 12, lineHeight: '16px' }}>RECEIPT</span>
                  </div>
                  <div className="flex items-center" style={{ height: 20 }}>
                    <CheckCircle2 style={{ width: 16, height: 16, marginRight: 6, color: isDark ? '#FFFFFF' : (isLoan ? '#F6465D' : '#0ECB81') }} />
                    <span className={`${isLoan ? 'text-[#F6465D]' : 'text-[#0ECB81]'}`} style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600 }}>Completed</span>
                  </div>
                </div>

                {/* Amount and Type */}
                <div className="text-center mb-4">
                  <div className={`text-[11px] ${palette.textSecondary} mb-1`}>Amount</div>
                  <div className={`text-3xl font-bold ${isLoan ? 'text-[#F6465D]' : 'text-[#0ECB81]'}`}>
                    {isLoan ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                  <div className={`mt-1 text-xs font-medium ${palette.textSecondary}`}>
                    {isLoan ? 'Loan Given' : 'Payment Received'}
                  </div>
                </div>

                {/* Lender / Borrower */}
                <div className={`grid grid-cols-2 gap-4 py-4 border-t ${palette.divider}`}>
                  <div>
                    <div className={`text-[11px] ${palette.textSecondary}`}>Lender</div>
                    <div className={`text-[13px] font-semibold mt-1 ${palette.textPrimary}`}>
                      {user?.full_name || 'Admin'}
                    </div>
                  </div>
                  <div>
                    <div className={`text-[11px] ${palette.textSecondary}`}>Borrower</div>
                    <div className={`text-[13px] font-semibold mt-1 ${palette.textPrimary}`}>
                      {friend.name}
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className={`grid grid-cols-2 gap-4 py-4 border-t ${palette.divider}`}>
                  <div>
                    <div className="flex items-center" style={{ height: 18 }}>
                      <Calendar className="h-[12px] w-[12px]" style={{ color: isDark ? '#FFFFFF' : '#6B7280' }} />
                      <span className={`ml-1.5 text-[11px] ${palette.textSecondary}`}>Date</span>
                    </div>
                    <div className={`text-[13px] font-semibold mt-2 leading-tight ${palette.textPrimary}`}>
                      {transactionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center" style={{ height: 18 }}>
                      <Hash className="h-[12px] w-[12px]" style={{ color: isDark ? '#FFFFFF' : '#6B7280' }} />
                      <span className={`ml-1.5 text-[11px] ${palette.textSecondary}`}>Transaction ID</span>
                    </div>
                    <div className={`text-[13px] font-semibold mt-2 leading-tight ${palette.textPrimary}`}>#{transaction.id}</div>
                  </div>
                </div>

                {/* Note */}
                {transaction.description && (
                  <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-[#0E1217]' : 'bg-gray-50'} border ${palette.divider}`}>
                    <div className={`text-xs mb-1 ${palette.textSecondary}`}>Note</div>
                    <div className={`text-sm ${palette.textPrimary}`}>{transaction.description}</div>
                  </div>
                )}

                {/* Footer */}
                <div className={`mt-4 pt-3 border-t ${palette.divider} text-center`}>
                  <div className={`text-[10px] ${palette.textSecondary}`}>
                    Generated on {new Date().toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                  <div className={`text-[10px] mt-1 ${palette.textSecondary}`}>
                    <span className="font-semibold">ogopay.com</span> • OgoTechnology
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>{isGenerating ? 'Generating...' : 'Download PNG'}</span>
              </button>
              
              <button
                onClick={handleShare}
                disabled={isGenerating || isSharing}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>{isSharing ? 'Sharing...' : 'Share PNG'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};