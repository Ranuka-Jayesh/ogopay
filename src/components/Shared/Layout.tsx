import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LogOut, User, Moon, Sun, Users, Plus, Settings, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
  title: string;
  showAdminActions?: boolean;
  onAddFriend?: () => void;
  onRecordTransaction?: () => void;
}

// Helper for avatar (profile photo or initials)
const ProfileAvatar = ({ name, photo }: { name?: string; photo?: string }) => {
  if (photo) {
    return <img src={photo} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-primary-200 dark:border-primary-900 shadow" />;
  }
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  return (
    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-bold text-primary-700 dark:text-primary-300 text-sm shadow">
      {initials}
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, title, showAdminActions, onAddFriend, onRecordTransaction }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  // Navigation handlers
  const handleProfileClick = () => {
    setDropdownOpen(false);
    setSidebarOpen(false);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    setDropdownOpen(false);
    setSidebarOpen(false);
    // TODO: Navigate to settings page when created
    console.log('Settings clicked');
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    setSidebarOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-900 transition-colors">
      <header className="sticky top-0 z-30 w-full backdrop-blur bg-white/70 dark:bg-secondary-900/80 shadow-md border-b border-primary-100 dark:border-secondary-800 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center font-extrabold text-xl text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 transition-colors cursor-pointer"
          >
            Ogo Pay
          </button>
          {/* Desktop Navigation/Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {showAdminActions && (
              <>
                <button
                  onClick={onAddFriend}
                  className="ml-4 flex items-center gap-1 text-sm text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 bg-transparent p-0 font-normal shadow-none"
                  style={{ background: 'none', border: 'none' }}
                >
                  <Users className="h-4 w-4 mr-1" /> Add Friend
                </button>
                <button
                  onClick={onRecordTransaction}
                  className="ml-3 flex items-center gap-1 text-sm text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 bg-transparent p-0 font-normal shadow-none"
                  style={{ background: 'none', border: 'none' }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Record Transaction
                </button>
              </>
            )}
            {/* Profile Avatar with Dropdown */}
            <div className="relative ml-4" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center focus:outline-none group"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <ProfileAvatar name={user?.full_name} photo={user?.profile_photo_url} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-primary-100 dark:border-secondary-700 py-2 z-50 animate-fade-in">
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-secondary-700 transition-colors text-sm"
                    onClick={handleSettingsClick}
                  >
                    <Settings className="h-4 w-4" /> Setting
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-secondary-700 transition-colors text-sm"
                    onClick={handleProfileClick}
                  >
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <div className="border-t border-gray-200 dark:border-secondary-600 my-1"></div>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-700 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
              </div>
          {/* Mobile Theme Toggle & Menu Icon */}
          <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-700 rounded-lg transition-colors"
              aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-700 rounded-lg transition-colors"
              aria-label="Open menu"
              >
              <Menu className="h-5 w-5" />
              </button>
          </div>
        </div>
        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex md:hidden" onClick={() => setSidebarOpen(false)}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[6px] transition-all duration-300" />
              <motion.aside
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative h-screen w-72 max-w-full bg-gray-950/95 dark:bg-secondary-950/95 backdrop-blur-lg shadow-2xl flex flex-col p-6"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
                {/* Profile section at the top */}
                <div className="flex flex-col items-center gap-2 mb-8 mt-2">
                  <ProfileAvatar name={user?.full_name} photo={user?.profile_photo_url} />
                  <span className="text-base text-gray-100 font-semibold text-center">
                    {user?.full_name ? user.full_name.split(' ')[0] : ''}
                    {user?.full_name && user.full_name.split(' ').length > 1 ? <span> {user.full_name.split(' ').slice(1).join(' ')}</span> : ''}
                  </span>
                </div>
                <nav className="flex flex-col gap-6 text-lg font-semibold flex-1">
                  {showAdminActions && (
                    <>
                      <button onClick={() => { setSidebarOpen(false); onAddFriend?.(); }} className="flex items-center gap-2 text-gray-200 hover:text-primary-400 text-base">
                        <Users className="h-5 w-5" /> Add Friend
                      </button>
                      <button onClick={() => { setSidebarOpen(false); onRecordTransaction?.(); }} className="flex items-center gap-2 text-gray-200 hover:text-primary-400 text-base">
                        <Plus className="h-5 w-5" /> Record Transaction
                      </button>
                    </>
                  )}
                  <div className="flex flex-col gap-4 mt-4">
                    <button onClick={handleProfileClick} className="flex items-center gap-2 text-gray-200 hover:text-primary-400 text-base">
                      <User className="h-5 w-5" /> Profile
                    </button>
                    <button onClick={handleSettingsClick} className="flex items-center gap-2 text-gray-200 hover:text-primary-400 text-base">
                      <Settings className="h-5 w-5" /> Setting
                    </button>
                  </div>
                </nav>
                {/* Logout at the very bottom */}
                <div className="mt-auto pt-8">
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 justify-center text-red-400 hover:text-red-300 text-base font-semibold">
                    <LogOut className="h-5 w-5" /> Logout
                  </button>
                </div>
                {/* Sidebar footer with version and Ogo Technology link */}
                <div className="mt-4 mb-2 text-center text-xs text-gray-400">
                  v1.0.0 &nbsp;|&nbsp; by <a href="https://ogotechnology.net" target="_blank" rel="noopener noreferrer" className="font-bold text-primary-500 hover:text-primary-600 no-underline">Ogo Technology</a>
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-12">
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
        {children}
      </main>
    </div>
  );
};