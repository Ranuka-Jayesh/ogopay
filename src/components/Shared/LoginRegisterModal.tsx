import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X, Check, X as XIcon, AlertCircle, UserCheck, Sparkles, PartyPopper } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface LoginRegisterModalProps {
  open: boolean;
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

// Password strength checker
const checkPasswordStrength = (password: string) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  score += checks.length ? 1 : 0;
  score += checks.lowercase ? 1 : 0;
  score += checks.uppercase ? 1 : 0;
  score += checks.numbers ? 1 : 0;
  score += checks.special ? 1 : 0;

  return { score, checks };
};

// Email validation
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// WhatsApp number validation against database
const checkWhatsAppExists = async (whatsappNumber: string): Promise<{
  exists: boolean;
  type: 'user' | 'friend' | 'none';
  message: string;
}> => {
  try {
    // First check if user already exists
    const { data: userData } = await supabase
      .from('users')
      .select('whatsapp_number')
      .eq('whatsapp_number', whatsappNumber)
      .single();

    if (userData) {
      return {
        exists: true,
        type: 'user',
        message: 'You are already registered in this system. Please login instead.'
      };
    }

    // If not in users table, check friends table
    const { data: friendData } = await supabase
      .from('friends')
      .select('whatsapp_number, full_name')
      .eq('whatsapp_number', whatsappNumber)
      .single();

    if (friendData) {
      return {
        exists: true,
        type: 'friend',
        message: `Welcome ${friendData.full_name}! You are already added as a friend. Would you like to create your own account to manage loans and transactions?`
      };
    }

    // Not found in either table
    return {
      exists: false,
      type: 'none',
      message: 'WhatsApp number is available for registration.'
    };

  } catch (error) {
    console.error('WhatsApp validation error:', error);
    return {
      exists: false,
      type: 'none',
      message: 'WhatsApp number is available for registration.'
    };
  }
};

// Interactive Popup Component
const InteractivePopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  type: 'error' | 'success' | 'info';
  title: string;
  message: string;
  icon?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}> = ({ isOpen, onClose, type, title, message, icon, primaryAction, secondaryAction }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`relative max-w-xs w-full mx-4 p-5 rounded-2xl shadow-xl backdrop-blur-lg ${
              type === 'success' 
                ? 'bg-white/90 dark:bg-secondary-800/90 border border-green-200 dark:border-green-700' 
                : type === 'error'
                ? 'bg-white/90 dark:bg-secondary-800/90 border border-red-200 dark:border-red-700'
                : 'bg-white/90 dark:bg-secondary-800/90 border border-primary-200 dark:border-primary-700'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                className={`p-3 rounded-full ${
                  type === 'success' 
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700' 
                    : type === 'error'
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : 'bg-gradient-to-r from-primary-600 to-primary-700'
                }`}
              >
                {icon || (
                  type === 'success' ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : type === 'error' ? (
                    <AlertCircle className="h-6 w-6 text-white" />
                  ) : (
                    <UserCheck className="h-6 w-6 text-white" />
                  )
                )}
              </motion.div>
            </div>

            {/* Content */}
            <div className="text-center">
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-lg font-bold mb-2 text-gray-900 dark:text-white`}
              >
                {title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-xs leading-relaxed text-gray-600 dark:text-gray-300`}
              >
                {message}
              </motion.p>
            </div>

            {/* Action buttons */}
            <div className="mt-4 space-y-2">
              {primaryAction && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={primaryAction.onClick}
                  className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                    primaryAction.variant === 'secondary'
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-md hover:shadow-lg'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {primaryAction.label}
                </motion.button>
              )}
              
              {secondaryAction && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={secondaryAction.onClick}
                  className="w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 bg-transparent border border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {secondaryAction.label}
                </motion.button>
              )}
              
              {!primaryAction && !secondaryAction && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={onClose}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    type === 'success'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                      : type === 'error'
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  Got it
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const LoginRegisterModal: React.FC<LoginRegisterModalProps> = ({ open, mode, onClose, onSwitchMode }) => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Register fields
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [, setWhatsapp] = useState('');

  // Validation states
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, checks: { length: false, lowercase: false, uppercase: false, numbers: false, special: false } });
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const [nameValid, setNameValid] = useState<boolean | null>(null);
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<{
    type: 'error' | 'success' | 'info';
    title: string;
    message: string;
    icon?: React.ReactNode;
    primaryAction?: {
      label: string;
      onClick: () => void;
      variant?: 'primary' | 'secondary';
    };
    secondaryAction?: {
      label: string;
      onClick: () => void;
    };
  }>({ type: 'error', title: '', message: '' });

  // Country data for code, flag, phone length, and currency
  const COUNTRY_DATA = [
    { code: '+94', flag: 'lk', name: 'Sri Lanka', digits: 9, currency: 'LKR' },
    { code: '+91', flag: 'in', name: 'India', digits: 10, currency: 'INR' },
    { code: '+1', flag: 'us', name: 'United States', digits: 10, currency: 'USD' },
    { code: '+44', flag: 'gb', name: 'United Kingdom', digits: 10, currency: 'GBP' },
    { code: '+61', flag: 'au', name: 'Australia', digits: 9, currency: 'AUD' },
    { code: '+81', flag: 'jp', name: 'Japan', digits: 10, currency: 'JPY' },
    { code: '+49', flag: 'de', name: 'Germany', digits: 11, currency: 'EUR' },
    { code: '+33', flag: 'fr', name: 'France', digits: 9, currency: 'EUR' },
    { code: '+7', flag: 'ru', name: 'Russia', digits: 10, currency: 'RUB' },
    { code: '+34', flag: 'es', name: 'Spain', digits: 9, currency: 'EUR' },
    { code: '+39', flag: 'it', name: 'Italy', digits: 10, currency: 'EUR' },
    { code: '+86', flag: 'cn', name: 'China', digits: 11, currency: 'CNY' },
    { code: '+971', flag: 'ae', name: 'UAE', digits: 9, currency: 'AED' },
    { code: '+880', flag: 'bd', name: 'Bangladesh', digits: 10, currency: 'BDT' },
    { code: '+92', flag: 'pk', name: 'Pakistan', digits: 10, currency: 'PKR' },
    { code: '+966', flag: 'sa', name: 'Saudi Arabia', digits: 9, currency: 'SAR' },
    { code: '+20', flag: 'eg', name: 'Egypt', digits: 10, currency: 'EGP' },
    { code: '+234', flag: 'ng', name: 'Nigeria', digits: 10, currency: 'NGN' },
    { code: '+27', flag: 'za', name: 'South Africa', digits: 9, currency: 'ZAR' },
    { code: '+62', flag: 'id', name: 'Indonesia', digits: 10, currency: 'IDR' },
    { code: '+63', flag: 'ph', name: 'Philippines', digits: 10, currency: 'PHP' },
    { code: '+55', flag: 'br', name: 'Brazil', digits: 11, currency: 'BRL' },
    { code: '+82', flag: 'kr', name: 'South Korea', digits: 10, currency: 'KRW' },
    { code: '+972', flag: 'il', name: 'Israel', digits: 9, currency: 'ILS' },
    { code: '+90', flag: 'tr', name: 'Turkey', digits: 10, currency: 'TRY' },
    { code: '+48', flag: 'pl', name: 'Poland', digits: 9, currency: 'PLN' },
    { code: '+380', flag: 'ua', name: 'Ukraine', digits: 9, currency: 'UAH' },
    { code: '+351', flag: 'pt', name: 'Portugal', digits: 9, currency: 'EUR' },
    { code: '+358', flag: 'fi', name: 'Finland', digits: 9, currency: 'EUR' },
    { code: '+46', flag: 'se', name: 'Sweden', digits: 9, currency: 'SEK' },
    { code: '+31', flag: 'nl', name: 'Netherlands', digits: 9, currency: 'EUR' },
    { code: '+32', flag: 'be', name: 'Belgium', digits: 9, currency: 'EUR' },
    { code: '+47', flag: 'no', name: 'Norway', digits: 8, currency: 'NOK' },
    { code: '+420', flag: 'cz', name: 'Czechia', digits: 9, currency: 'CZK' },
    { code: '+36', flag: 'hu', name: 'Hungary', digits: 9, currency: 'HUF' },
    { code: '+43', flag: 'at', name: 'Austria', digits: 10, currency: 'EUR' },
    { code: '+41', flag: 'ch', name: 'Switzerland', digits: 9, currency: 'CHF' },
    { code: '+65', flag: 'sg', name: 'Singapore', digits: 8, currency: 'SGD' },
    { code: '+66', flag: 'th', name: 'Thailand', digits: 9, currency: 'THB' },
    { code: '+60', flag: 'my', name: 'Malaysia', digits: 9, currency: 'MYR' },
    { code: '+64', flag: 'nz', name: 'New Zealand', digits: 9, currency: 'NZD' },
    { code: '+998', flag: 'uz', name: 'Uzbekistan', digits: 9, currency: 'UZS' },
    { code: '+84', flag: 'vn', name: 'Vietnam', digits: 9, currency: 'VND' },
    { code: '+855', flag: 'kh', name: 'Cambodia', digits: 9, currency: 'KHR' },
    { code: '+856', flag: 'la', name: 'Laos', digits: 9, currency: 'LAK' },
    { code: '+95', flag: 'mm', name: 'Myanmar', digits: 9, currency: 'MMK' },
  ];

  const [countryCode, setCountryCode] = useState('+94');
  const [phone, setPhone] = useState('');

  // Helper function to get currency based on country code
  const getCurrencyByCountryCode = (code: string): string => {
    const country = COUNTRY_DATA.find(c => c.code === code);
    return country?.currency || 'LKR'; // Default to LKR if not found
  };

  const modalRef = useRef<HTMLDivElement>(null);

  // Validation effects
  useEffect(() => {
    if (email) {
      setEmailValid(validateEmail(email));
    } else {
      setEmailValid(null);
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, checks: { length: false, lowercase: false, uppercase: false, numbers: false, special: false } });
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword && password) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(null);
    }
  }, [confirmPassword, password]);

  useEffect(() => {
    if (name) {
      setNameValid(name.length >= 2);
    } else {
      setNameValid(null);
    }
  }, [name]);

  useEffect(() => {
    const selectedCountry = COUNTRY_DATA.find(c => c.code === countryCode);
    if (phone && selectedCountry) {
      setPhoneValid(phone.length === selectedCountry.digits);
    } else {
      setPhoneValid(null);
    }
  }, [phone, countryCode]);

  // Trap focus
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Reset form on open
  useEffect(() => {
    if (open) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setError('');
      setIsLoading(false);
      setName('');
      setConfirmPassword('');
      setWhatsapp('');
      setCountryCode('+94');
      setPhone('');
      // Reset validation states
      setEmailValid(null);
      setPasswordStrength({ score: 0, checks: { length: false, lowercase: false, uppercase: false, numbers: false, special: false } });
      setPasswordsMatch(null);
      setNameValid(null);
      setPhoneValid(null);
    }
  }, [open, mode]);

  // Show popup function
  const showPopupMessage = (type: 'error' | 'success' | 'info', title: string, message: string, icon?: React.ReactNode, primaryAction?: any, secondaryAction?: any) => {
    setPopupData({ type, title, message, icon, primaryAction, secondaryAction });
    setShowPopup(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const result = await login({
          email,
          password
        });

        if (result.success) {
          onClose();
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        // Registration - Check WhatsApp number first
        const whatsappNumber = `${countryCode}${phone}`;
        
        // Check if WhatsApp number already exists
        const whatsappExists = await checkWhatsAppExists(whatsappNumber);
        
        if (whatsappExists.exists) {
          if (whatsappExists.type === 'user') {
            // Show personalized "Already Registered" popup with login button
            setPopupData({
              type: 'info',
              title: 'Welcome Back! 👋',
              message: 'It looks like you already have an account with us. Would you like to sign in to continue managing your loans and transactions?',
              icon: <UserCheck className="h-8 w-8 text-white" />,
              primaryAction: {
                label: 'Sign In Now',
                onClick: () => {
                  setShowPopup(false);
                  onSwitchMode('login');
                },
                variant: 'primary'
              },
              secondaryAction: {
                label: 'Stay Here',
                onClick: () => {
                  setShowPopup(false);
                }
              }
            });
            setShowPopup(true);
            setIsLoading(false);
            return;
          } else if (whatsappExists.type === 'friend') {
            // Show friend popup with continue registration option
            setPopupData({
              type: 'info',
              title: 'Hey there! 👋',
              message: `Great to see you, ${whatsappExists.message.split('!')[0].split(' ').pop()}! You're already in our system as a friend. Would you like to create your own account to manage loans and transactions?`,
              icon: <UserCheck className="h-6 w-6 text-white" />,
              primaryAction: {
                label: 'Continue Registration',
                onClick: async () => {
                  setShowPopup(false);
                  setIsLoading(true);
                  
                  // Proceed with registration for friend
                  const result = await register({
                    email,
                    password,
                    full_name: name,
                    whatsapp_number: whatsappNumber,
                    preferred_currency: getCurrencyByCountryCode(countryCode)
                  });

                  if (result.success) {
                    showPopupMessage(
                      'success',
                      'You\'re all set! 🎉',
                      'Welcome to Ogo Pay! Your account is ready. Start managing your loans and transactions now.',
                      <div className="flex items-center justify-center">
                        <PartyPopper className="h-5 w-5 text-white mr-1" />
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                    );
                    
                    setTimeout(() => {
                      onClose();
                    }, 2000);
                  } else {
                    setError(result.error || 'Registration failed');
                  }
                  setIsLoading(false);
                },
                variant: 'primary'
              },
              secondaryAction: {
                label: 'Go to Login',
                onClick: () => {
                  setShowPopup(false);
                  onSwitchMode('login');
                }
              }
            });
            setShowPopup(true);
            setIsLoading(false);
            return;
          }
        }

        // Proceed with registration
        const result = await register({
          email,
          password,
          full_name: name,
          whatsapp_number: whatsappNumber,
          preferred_currency: getCurrencyByCountryCode(countryCode)
        });

        if (result.success) {
          // Show success popup
          showPopupMessage(
            'success',
            'Welcome to Ogo Pay! 🎉',
            'Your account has been created successfully. You can now start managing your loans and transactions.',
            <div className="flex items-center justify-center">
              <PartyPopper className="h-6 w-6 text-white mr-2" />
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          );
          
          // Close modal after a short delay
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setError(result.error || 'Registration failed');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Get password strength color and text
  const getPasswordStrengthInfo = () => {
    const { score } = passwordStrength;
    if (score <= 1) return { color: 'bg-red-500', text: 'Very Weak' };
    if (score <= 2) return { color: 'bg-orange-500', text: 'Weak' };
    if (score <= 3) return { color: 'bg-yellow-500', text: 'Fair' };
    if (score <= 4) return { color: 'bg-blue-500', text: 'Good' };
    return { color: 'bg-green-500', text: 'Strong' };
  };

  const strengthInfo = getPasswordStrengthInfo();

  return (
    <>
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
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-xs sm:max-w-sm relative flex flex-col items-center max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-xl font-bold focus:outline-none"><X className="h-5 w-5" /></button>
              <h2 id="modal-title" className="text-xl font-bold mb-2 text-primary-700 dark:text-primary-300">
                {mode === 'login' ? 'Sign In to Ogo Pay' : 'Create Your Account'}
              </h2>
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-2">
                {mode === 'register' && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-800 bg-white dark:bg-secondary-700 text-gray-900 dark:text-white text-sm pr-10 ${
                        nameValid === true ? 'border-green-500 dark:border-green-400' : 
                        nameValid === false ? 'border-red-500 dark:border-red-400' : 
                        'border-gray-300 dark:border-secondary-600'
                      }`}
                      required
                    />
                    {nameValid !== null && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {nameValid ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <XIcon className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-800 bg-white dark:bg-secondary-700 text-gray-900 dark:text-white text-sm pr-10 ${
                      emailValid === true ? 'border-green-500 dark:border-green-400' : 
                      emailValid === false ? 'border-red-500 dark:border-red-400' : 
                      'border-gray-300 dark:border-secondary-600'
                    }`}
                    required
                  />
                  {emailValid !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailValid ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <XIcon className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {mode === 'register' && (
                  <div className="flex gap-2">
                    <div className="relative w-24 flex-shrink-0">
                      <input
                        type="text"
                        placeholder="+94"
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value.replace(/[^+\d]/g, '').slice(0, 5))}
                        className="w-full pl-10 pr-2 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-800 bg-white dark:bg-secondary-700 text-gray-900 dark:text-white text-sm"
                        required
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 select-none pointer-events-none">
                        {COUNTRY_DATA.some(c => c.code === countryCode) ? (
                          <img
                            src={`https://flagcdn.com/24x18/${COUNTRY_DATA.find(c => c.code === countryCode)?.flag}.png`}
                            alt="flag"
                            className="w-6 h-4 rounded shadow border"
                          />
                        ) : (
                          <span className="text-lg">🌐</span>
                        )}
                      </span>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        placeholder={COUNTRY_DATA.find(c => c.code === countryCode)?.digits ? `WhatsApp (${COUNTRY_DATA.find(c => c.code === countryCode)?.digits} digits)` : 'WhatsApp Number'}
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, COUNTRY_DATA.find(c => c.code === countryCode)?.digits || 9))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-800 bg-white dark:bg-secondary-700 text-gray-900 dark:text-white text-sm pr-10 ${
                          phoneValid === true ? 'border-green-500 dark:border-green-400' : 
                          phoneValid === false ? 'border-red-500 dark:border-red-400' : 
                          'border-gray-300 dark:border-secondary-600'
                        }`}
                        required
                      />
                      {phoneValid !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {phoneValid ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <XIcon className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-800 bg-white dark:bg-secondary-700 text-gray-900 dark:text-white text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator - Only show in register mode */}
                {password && mode === 'register' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Password Strength:</span>
                      <span className={`font-medium ${strengthInfo.color.replace('bg-', 'text-')}`}>
                        {strengthInfo.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${strengthInfo.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(passwordStrength.checks).map(([key, passed]) => (
                        <div key={key} className="flex items-center gap-1">
                          {passed ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <XIcon className="h-3 w-3 text-red-500" />
                          )}
                          <span className={passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {key === 'length' && '8+ characters'}
                            {key === 'lowercase' && 'Lowercase'}
                            {key === 'uppercase' && 'Uppercase'}
                            {key === 'numbers' && 'Numbers'}
                            {key === 'special' && 'Special chars'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mode === 'register' && (
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-800 bg-white dark:bg-secondary-700 text-gray-900 dark:text-white text-sm pr-10 ${
                        passwordsMatch === true ? 'border-green-500 dark:border-green-400' : 
                        passwordsMatch === false ? 'border-red-500 dark:border-red-400' : 
                        'border-gray-300 dark:border-secondary-600'
                      }`}
                      required
                    />
                    {passwordsMatch !== null && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {passwordsMatch ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <XIcon className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-2 rounded-lg text-xs text-center flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>}
                
                <button
                  type="submit"
                  disabled={isLoading || (mode === 'register' && (!emailValid || passwordStrength.score < 3 || !passwordsMatch || !nameValid || !phoneValid))}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-800 font-semibold text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (mode === 'login' ? 'Signing In...' : 'Creating Account...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
                </button>
              </form>
              <div className="mt-4 text-center text-xs text-gray-600 dark:text-gray-300">
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button onClick={() => onSwitchMode('register')} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium underline underline-offset-2 transition-colors">Sign up</button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button onClick={() => onSwitchMode('login')} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium underline underline-offset-2 transition-colors">Sign in</button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Popup */}
      <InteractivePopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        type={popupData.type}
        title={popupData.title}
        message={popupData.message}
        icon={popupData.icon}
        primaryAction={popupData.primaryAction}
        secondaryAction={popupData.secondaryAction}
      />
    </>
  );
};

export default LoginRegisterModal; 