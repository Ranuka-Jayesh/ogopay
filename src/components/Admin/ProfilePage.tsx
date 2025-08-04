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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../Shared/Layout';
import { supabase } from '../../lib/supabase';
import Lenis from '@studio-freight/lenis';

interface ProfileFormData {
  full_name: string;
  email: string;
  whatsapp_number: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
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
      
      // Refresh user data (you might want to update the auth context)
      window.location.reload();
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

  // Delete account
  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

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
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-secondary-700 dark:to-secondary-600 rounded-2xl">
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
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-secondary-600 dark:to-secondary-500 text-gray-700 dark:text-gray-300 rounded-xl hover:from-gray-300 hover:to-gray-400 dark:hover:from-secondary-500 dark:hover:to-secondary-400 transition-all duration-200 shadow-lg"
                        >
                          <Palette className="h-5 w-5" />
                          {isDark ? 'Light' : 'Dark'}
                        </motion.button>
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
                          onClick={handleDeleteAccount}
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
    </Layout>
  );
};

export default ProfilePage; 