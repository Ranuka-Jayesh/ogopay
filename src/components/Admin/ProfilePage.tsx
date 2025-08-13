import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Shield, 
  Palette,
  Trash2,
  AlertCircle,
  CheckCircle,
  Settings,
  Lock,
  Smartphone,
  Image,
  Crown,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../Shared/Layout';
import { supabase } from '../../lib/supabase';
import Lenis from '@studio-freight/lenis';

// Interactive Popup Component for Delete Account Confirmation
const InteractivePopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  type: 'error' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
  icon?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
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
            className={`relative max-w-sm w-full mx-4 p-6 rounded-2xl shadow-xl backdrop-blur-lg ${
              type === 'success' 
                ? 'bg-white/90 dark:bg-secondary-800/90 border border-green-200 dark:border-green-700' 
                : type === 'error'
                ? 'bg-white/90 dark:bg-secondary-800/90 border border-red-200 dark:border-red-700'
                : type === 'warning'
                ? 'bg-white/90 dark:bg-secondary-800/90 border border-orange-200 dark:border-orange-700'
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
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                className={`p-4 rounded-full ${
                  type === 'success' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                    : type === 'error'
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : type === 'warning'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600'
                    : 'bg-gradient-to-r from-primary-600 to-primary-700'
                }`}
              >
                {icon || (
                  type === 'success' ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : type === 'error' ? (
                    <AlertCircle className="h-6 w-6 text-white" />
                  ) : type === 'warning' ? (
                    <AlertCircle className="h-6 w-6 text-white" />
                  ) : (
                    <User className="h-6 w-6 text-white" />
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
                className="text-xl font-bold mb-3 text-gray-900 dark:text-white"
              >
                {title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 mb-4"
              >
                {message}
              </motion.p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {secondaryAction && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={secondaryAction.onClick}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                >
                  {secondaryAction.label}
                </motion.button>
              )}
              
              {primaryAction && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={primaryAction.onClick}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    primaryAction.variant === 'danger'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg'
                      : primaryAction.variant === 'secondary'
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-md hover:shadow-lg'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {primaryAction.label}
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ProfileFormData {
  full_name: string;
  email: string;
  whatsapp_number: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'preferences' | 'danger'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: user?.full_name || '',
    email: user?.email || '',
    whatsapp_number: user?.whatsapp_number || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Smooth scrolling setup (same as AdminDashboard)
  useEffect(() => {
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

  // Handle form data changes
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle profile photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Remove profile photo
  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      let profile_photo_url = user?.profile_photo_url;

      // Upload new profile photo if selected
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, profilePhoto);

        if (uploadError) {
          throw new Error(`Failed to upload photo: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);
        
        profile_photo_url = urlData.publicUrl;
      }

      // Update user profile
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          whatsapp_number: formData.whatsapp_number,
          profile_photo_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      // Update auth context without full reload
      updateUser({
        full_name: formData.full_name,
        email: formData.email,
        whatsapp_number: formData.whatsapp_number,
        profile_photo_url
      });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (formData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Verify current password first
      const currentPasswordHash = btoa(formData.current_password);
      const { data: userData, error: verifyError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user?.id)
        .eq('password_hash', currentPasswordHash)
        .single();

      if (verifyError || !userData) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const newPasswordHash = btoa(formData.new_password);
      const { error } = await supabase
        .from('users')
        .update({
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) {
        throw new Error(`Failed to update password: ${error.message}`);
      }

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to change password' });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete account confirmation popup state
  const [showDeleteAccountPopup, setShowDeleteAccountPopup] = useState(false);

  // Delete account
  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user?.id);

      if (error) {
        throw new Error(`Failed to delete account: ${error.message}`);
      }

      logout();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete account' });
      setIsLoading(false);
    }
  };

  // Show delete account confirmation popup
  const showDeleteAccountConfirmation = () => {
    setShowDeleteAccountPopup(true);
  };

  // State for currency preference
  const [selectedCurrency, setSelectedCurrency] = useState(user?.preferred_currency || 'LKR');
  const [showCurrencyConfirmation, setShowCurrencyConfirmation] = useState(false);
  const [pendingCurrencyChange, setPendingCurrencyChange] = useState<string | null>(null);
  const [isUpdatingCurrency, setIsUpdatingCurrency] = useState(false);

  // Update selectedCurrency when user changes
  useEffect(() => {
    if (user?.preferred_currency) {
      setSelectedCurrency(user.preferred_currency);
    }
  }, [user?.preferred_currency]);

  // Handle currency selection (show confirmation first)
  const handleCurrencySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    if (newCurrency !== selectedCurrency) {
      setPendingCurrencyChange(newCurrency);
      setShowCurrencyConfirmation(true);
    }
  };

  // Handle currency change confirmation
  const handleCurrencyChange = async () => {
    if (!pendingCurrencyChange || !user?.id) return;
    
    setIsUpdatingCurrency(true);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ preferred_currency: pendingCurrencyChange })
        .eq('id', user.id);

      if (error) {
        throw new Error(`Failed to update currency: ${error.message}`);
      }

      // Update local user state
      updateUser({ preferred_currency: pendingCurrencyChange });
      
      // Update selected currency
      setSelectedCurrency(pendingCurrencyChange);
      
      // Show success message briefly
      setMessage({ type: 'success', text: 'Currency updated successfully! Refreshing...' });
      
      // Close confirmation modal
      setShowCurrencyConfirmation(false);
      setPendingCurrencyChange(null);
      
      // Refresh the entire page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update currency preference' });
      // Revert to previous currency on error
      setSelectedCurrency(user.preferred_currency || 'LKR');
      setShowCurrencyConfirmation(false);
      setPendingCurrencyChange(null);
    } finally {
      setIsUpdatingCurrency(false);
    }
  };

  // Cancel currency change
  const handleCancelCurrencyChange = () => {
    setShowCurrencyConfirmation(false);
    setPendingCurrencyChange(null);
    setIsUpdatingCurrency(false);
    // Reset select to current currency
    const selectElement = document.getElementById('currency-select') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = selectedCurrency;
    }
  };



  const sections = [
    { id: 'profile', label: 'Profile', icon: User, color: 'from-blue-500 to-cyan-500' },
    { id: 'security', label: 'Security', icon: Shield, color: 'from-green-500 to-emerald-500' },
    { id: 'preferences', label: 'Preferences', icon: Settings, color: 'from-purple-500 to-pink-500' },
    { id: 'danger', label: 'Danger Zone', icon: AlertCircle, color: 'from-red-500 to-orange-500' }
  ];

  return (
    <Layout 
      title="Profile Settings"
      showAdminActions
      onAddFriend={() => navigate('/')}
      onRecordTransaction={() => navigate('/')}
      onLogoClick={() => navigate('/')}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-900">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
                    <img
                      src={photoPreview || user?.profile_photo_url || `https://ui-avatars.com/api/?name=${user?.full_name}&background=10b981&color=fff&size=128`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-white text-primary-600 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Camera className="h-4 w-4" />
                    </motion.button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2">{user?.full_name || 'User'}</h1>
                  <p className="text-primary-100 text-lg mb-4">{user?.email}</p>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                      <Crown className="h-4 w-4" />
                      Admin
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                      <Sparkles className="h-4 w-4" />
                      Premium
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <X className="h-5 w-5" />
                      <span className="hidden sm:inline">Cancel</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-5 w-5" />
                      <span className="hidden sm:inline">Edit Profile</span>
                    </div>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Message Display */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className={`p-4 rounded-2xl flex items-center gap-3 shadow-lg ${
                    message.type === 'success' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                      : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-2">
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <motion.button
                    key={section.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveSection(section.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeSection === section.id
                        ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700'
                    }`}
                  >
                    <section.icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{section.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Section */}
              {activeSection === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="lg:col-span-2 space-y-6"
                >
                  <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-secondary-700">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                        <p className="text-gray-600 dark:text-gray-400">Update your profile details</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={formData.full_name}
                              onChange={(e) => handleInputChange('full_name', e.target.value)}
                              disabled={!isEditing}
                              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-secondary-600 rounded-xl bg-gray-50 dark:bg-secondary-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-secondary-600 focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              disabled={!isEditing}
                              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-secondary-600 rounded-xl bg-gray-50 dark:bg-secondary-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-secondary-600 focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          WhatsApp Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.whatsapp_number}
                            onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                            disabled={!isEditing}
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-secondary-600 rounded-xl bg-gray-50 dark:bg-secondary-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-secondary-600 focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
                            placeholder="Enter your WhatsApp number"
                          />
                        </div>
                      </div>

                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3 pt-4"
                        >
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSaveProfile}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 transition-all duration-200 shadow-lg"
                          >
                            <Save className="h-5 w-5" />
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </motion.button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="lg:col-span-2 space-y-6"
                >
                  <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-secondary-700">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
                        <p className="text-gray-600 dark:text-gray-400">Manage your account security</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.current_password}
                            onChange={(e) => handleInputChange('current_password', e.target.value)}
                            className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-secondary-600 rounded-xl bg-gray-50 dark:bg-secondary-700 text-gray-900 dark:text-white focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={formData.new_password}
                              onChange={(e) => handleInputChange('new_password', e.target.value)}
                              className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-secondary-600 rounded-xl bg-gray-50 dark:bg-secondary-700 text-gray-900 dark:text-white focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={formData.confirm_password}
                              onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                              className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-secondary-600 rounded-xl bg-gray-50 dark:bg-secondary-700 text-gray-900 dark:text-white focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleChangePassword}
                        disabled={isLoading || !formData.current_password || !formData.new_password || !formData.confirm_password}
                        className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 shadow-lg font-semibold"
                      >
                        {isLoading ? 'Changing Password...' : 'Change Password'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Preferences Section */}
              {activeSection === 'preferences' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="lg:col-span-2 space-y-6"
                >
                  <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-secondary-700">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                        <Settings className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preferences</h2>
                        <p className="text-gray-600 dark:text-gray-400">Customize your experience</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-secondary-700 dark:to-secondary-600 rounded-2xl">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                              <Palette className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dark Mode</h3>
                              <p className="text-gray-600 dark:text-gray-400">Toggle between light and dark theme</p>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleTheme}
                            className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-secondary-600 dark:to-secondary-500 text-gray-700 dark:text-gray-300 rounded-xl hover:from-gray-300 hover:to-gray-400 dark:hover:from-secondary-500 dark:hover:to-secondary-400 transition-all duration-200 shadow-lg"
                          >
                            <Palette className="h-5 w-5" />
                            {isDark ? 'Light' : 'Dark'}
                          </motion.button>
                        </div>
                      </div>

                      {/* Currency Preference */}
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                              <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preferred Currency</h3>
                              <p className="text-gray-600 dark:text-gray-400">Choose your default currency for transactions</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 w-full lg:w-auto">
                            <select
                              id="currency-select"
                              value={selectedCurrency}
                              onChange={handleCurrencySelection}
                              className="w-full lg:w-auto px-4 py-3 bg-white dark:bg-secondary-700 border border-gray-200 dark:border-secondary-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
                            >
                              <option value="LKR">LKR - Sri Lankan Rupee</option>
                              <option value="USD">USD - US Dollar</option>
                              <option value="EUR">EUR - Euro</option>
                              <option value="GBP">GBP - British Pound</option>
                              <option value="INR">INR - Indian Rupee</option>
                              <option value="AUD">AUD - Australian Dollar</option>
                              <option value="CAD">CAD - Canadian Dollar</option>
                              <option value="JPY">JPY - Japanese Yen</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Danger Zone Section */}
              {activeSection === 'danger' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="lg:col-span-2 space-y-6"
                >
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
                        <AlertCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">Danger Zone</h2>
                        <p className="text-red-700 dark:text-red-300">Irreversible actions</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-6 bg-white dark:bg-secondary-800 rounded-2xl border-2 border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
                            <Trash2 className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Delete Account</h3>
                            <p className="text-red-700 dark:text-red-300">
                              Once you delete your account, there is no going back. Please be certain.
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={showDeleteAccountConfirmation}
                          disabled={isLoading}
                          className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-200 shadow-lg font-semibold"
                        >
                          {isLoading ? 'Deleting...' : 'Delete Account'}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Photo Card */}
                <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-secondary-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                      <Image className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Photo</h3>
                      <p className="text-gray-600 dark:text-gray-400">Update your avatar</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <img
                        src={photoPreview || user?.profile_photo_url || `https://ui-avatars.com/api/?name=${user?.full_name}&background=10b981&color=fff&size=128`}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-primary-200 dark:border-primary-800 shadow-lg"
                      />
                      {isEditing && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Camera className="h-4 w-4" />
                        </motion.button>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex gap-2 w-full">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 text-sm font-medium"
                        >
                          Change Photo
                        </motion.button>
                        {photoPreview && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleRemovePhoto}
                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-medium"
                          >
                            Remove
                          </motion.button>
                        )}
                      </div>
                    )}

                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        JPG, PNG or GIF. Max size 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-secondary-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-secondary-700 rounded-xl">
                      <Smartphone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Role</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-secondary-700 rounded-xl">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-secondary-700 rounded-xl">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.whatsapp_number}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Currency Change Confirmation Modal */}
      <AnimatePresence>
        {showCurrencyConfirmation && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => handleCancelCurrencyChange()}
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
              aria-labelledby="currency-confirmation-title"
            >
              {/* Close button */}
              <button 
                onClick={handleCancelCurrencyChange} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold focus:outline-none transition-colors"
              >
                &times;
              </button>
              
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              {/* Title */}
              <h3 
                id="currency-confirmation-title"
                className="text-xl font-bold text-gray-900 dark:text-white text-center mb-4"
              >
                Change Currency Preference
              </h3>
              
              {/* Message */}
              <div className="text-center mb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Are you sure you want to change your preferred currency from{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedCurrency}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {pendingCurrencyChange}
                  </span>?
                </p>

              </div>
              
              {/* Progress Bar */}
              {isUpdatingCurrency && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Updating currency preference...</span>
                    <span className="text-blue-600 dark:text-blue-400">Please wait</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ 
                        duration: 2, 
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelCurrencyChange}
                  disabled={isUpdatingCurrency}
                  className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-secondary-600 rounded-xl hover:bg-gray-50 dark:hover:bg-secondary-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCurrencyChange}
                  disabled={isUpdatingCurrency}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdatingCurrency ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    'Change Currency'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Popup */}
      <InteractivePopup
        isOpen={showDeleteAccountPopup}
        onClose={() => setShowDeleteAccountPopup(false)}
        type="warning"
        title="Delete Account"
        message="Are you absolutely sure you want to delete your account? This action will permanently remove all your data, friends, and transactions. This action cannot be undone."
        icon={<Trash2 className="h-6 w-6 text-white" />}
        primaryAction={{
          label: "Delete Account",
          onClick: () => {
            setShowDeleteAccountPopup(false);
            handleDeleteAccount();
          },
          variant: "danger"
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setShowDeleteAccountPopup(false)
        }}
      />
    </Layout>
  );
};

export default ProfilePage; 