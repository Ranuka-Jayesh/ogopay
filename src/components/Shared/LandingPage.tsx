import React, { useState, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { motion } from 'framer-motion';
import { User, LogIn, FileText, BarChart2, Lock, Smartphone, Users, CheckCircle, MessageCircle, ChevronsUp, Sun, Moon, Shield, Ban, AlertTriangle, Mail, ClipboardList, Info, Server, Menu, X } from 'lucide-react';
import { Link as ScrollLink, animateScroll } from 'react-scroll';
import { AnimatePresence } from 'framer-motion';
import LoginRegisterModal from './LoginRegisterModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import StatsWidget from '../ui/stats-widget';

const steps = [
  { icon: <Users className="h-7 w-7 text-primary-600" />, title: 'Create a Friend Profile', desc: 'Quick setup to begin tracking.' },
  { icon: <FileText className="h-7 w-7 text-primary-600" />, title: 'Log Transactions', desc: 'Add money lent or repaid.' },
  { icon: <BarChart2 className="h-7 w-7 text-primary-600" />, title: 'Real-Time Tracking', desc: 'See balances and history at a glance.' },
];

const features = [
  { icon: <FileText className="h-6 w-6 text-primary-600" />, label: 'Loan & Repayment History' },
  { icon: <User className="h-6 w-6 text-primary-600" />, label: 'Secure Friend Login Access' },
  { icon: <BarChart2 className="h-6 w-6 text-primary-600" />, label: 'Live Balance Monitoring' },
  { icon: <Lock className="h-6 w-6 text-primary-600" />, label: 'Private & Encrypted Records' },
  { icon: <Smartphone className="h-6 w-6 text-primary-600" />, label: 'Mobile-Responsive Design' },
  { icon: <Users className="h-6 w-6 text-primary-600" />, label: 'Group Budget Management' },
];

const LandingPage: React.FC = () => {
  const [modal, setModal] = useState<null | 'terms' | 'privacy' | 'contact' | 'login' | 'register'>(null);
  const [showTop, setShowTop] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    // Show/hide back to top button
    const onScroll = () => {
      setShowTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll);
    // Listen for cross-page modal open
    const onOpenAuthModal = (e: any) => {
      if (e.detail === 'login' || e.detail === 'register') {
        setAuthMode(e.detail);
        setModal(e.detail);
      }
    };
    window.addEventListener('open-auth-modal', onOpenAuthModal);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('open-auth-modal', onOpenAuthModal);
      if (lenis) lenis.destroy();
    };
  }, []);

  const scrollToTop = () => {
    // Try to use Lenis if available
    const anyWindow = window as any;
    if (anyWindow.lenis) {
      anyWindow.lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closeModal = () => setModal(null);

  // Helper to open login/register modal
  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setModal(mode);
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 to-emerald-100 dark:from-secondary-900 dark:to-secondary-800 min-h-screen flex flex-col transition-all duration-500">
      {/* Next-level Header */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="sticky top-0 z-30 w-full backdrop-blur bg-white/70 dark:bg-secondary-900/80 shadow-md border-b border-primary-100 dark:border-secondary-800 transition-all duration-500"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 font-extrabold text-xl text-primary-700 dark:text-primary-300" onClick={() => animateScroll.scrollToTop({ duration: 600, smooth: 'easeInOutQuart' })}>
            Ogo Pay
          </a>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 text-base font-medium">
            <ScrollLink to="how" smooth={true} duration={600} offset={-80} spy={true} activeClass="text-primary-600 dark:text-primary-400 scale-105" className="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors transform-gpu">
              How it Works
            </ScrollLink>
            <ScrollLink to="features" smooth={true} duration={600} offset={-80} spy={true} activeClass="text-primary-600 dark:text-primary-400 scale-105" className="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors transform-gpu">
              Features
            </ScrollLink>
            <ScrollLink to="why" smooth={true} duration={600} offset={-80} spy={true} activeClass="text-primary-600 dark:text-primary-400 scale-105" className="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors transform-gpu">
              Why Ogo Pay
            </ScrollLink>
            <button
              onClick={() => navigate('/contact')}
              className={`cursor-pointer font-semibold px-2 transition-transform ${location.pathname === '/contact' ? 'text-primary-600 dark:text-primary-400 scale-105' : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400'}`}
            >
              Contact
            </button>
            <button
              onClick={() => navigate('/blog')}
              className="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-semibold px-2"
            >
              Blog
            </button>
          </nav>
          {/* Mobile Menu Icon */}
          <button
            className="md:hidden p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-7 w-7 text-primary-700 dark:text-primary-200" />
          </button>
          {/* CTA Buttons & Theme Toggle (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-2">
            <button onClick={toggleTheme} aria-label="Toggle dark mode" className="rounded-lg p-2 bg-primary-50 dark:bg-secondary-800 hover:bg-primary-100 dark:hover:bg-secondary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400">
              <motion.span key={isDark ? 'moon' : 'sun'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                {isDark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-primary-700" />}
              </motion.span>
            </button>
            <button onClick={() => openAuthModal('login')} className="px-4 py-2 rounded-lg font-semibold text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-secondary-800 transition-colors">Login</button>
            <button onClick={() => openAuthModal('register')} className="px-4 py-2 rounded-lg font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow transition-colors">Get Started</button>
          </div>
        </div>
      </motion.header>
      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between max-w-6xl mx-auto px-4 py-12 md:py-20 gap-10 w-full transition-all duration-500">
        {/* Text */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="flex-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Smart Personal Lending. <br className="hidden sm:block" />Powered by <span className="text-primary-600">Ogo Pay.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 mb-8 max-w-xl">
            Easily manage loans between friends, track repayments, and stay financially organized — all in one place.
          </p>
          <div className="flex gap-4 mb-8">
            <button onClick={() => openAuthModal('login')} className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all flex items-center gap-2">
              <LogIn className="h-5 w-5" /> Login to Ogo Pay
            </button>
            <button onClick={() => openAuthModal('register')} className="bg-white dark:bg-secondary-700 border border-primary-600 text-primary-700 dark:text-primary-300 font-semibold px-6 py-3 rounded-lg shadow hover:bg-primary-50 dark:hover:bg-secondary-800 transition-all flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Get Started
            </button>
          </div>
        </motion.div>
        {/* Visual - Dashboard Mockup with StatsWidget */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="flex-1 flex justify-center items-center transition-all duration-500">
          <div className="w-full max-w-md h-64 sm:h-80 bg-gradient-to-tr from-primary-100 to-emerald-200 dark:from-secondary-800 dark:to-secondary-700 rounded-2xl shadow-2xl border-4 border-primary-200 dark:border-secondary-700 flex flex-col items-center justify-center relative overflow-hidden p-4">
            <span className="absolute top-4 left-4 text-primary-600 font-bold text-lg">Ogo Pay Dashboard</span>
            <div className="w-full flex flex-col items-center justify-center h-full">
              <StatsWidget />
            </div>
            <span className="absolute bottom-4 right-4 text-xs text-gray-400">(UI Preview)</span>
          </div>
        </motion.div>
      </section>

      {/* How Ogo Pay Works */}
      <section id="how" className="bg-white dark:bg-secondary-800 py-12 px-4 transition-all duration-500">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">How Ogo Pay Works</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }} className="flex flex-col items-center text-center bg-primary-50 dark:bg-secondary-900 rounded-xl p-6 shadow-md w-full md:w-1/3">
                <div className="mb-3">{step.icon}</div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-12 px-4 transition-all duration-500">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }} className="flex items-center gap-3 bg-primary-50 dark:bg-secondary-900 rounded-xl p-5 shadow-md">
                {feature.icon}
                <span className="font-medium text-gray-800 dark:text-gray-200 text-base">{feature.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Ogo Pay */}
      <section id="why" className="bg-primary-50 dark:bg-secondary-900 py-12 px-4 transition-all duration-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Ogo Pay?</h2>
          <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
            Developed by <a href="https://ogotechnology.net" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 hover:text-primary-700 no-underline">Ogo Technology</a>, Ogo Pay brings you a powerful and simple tool to manage your personal financial circle. Whether you lend or borrow, your records are safe, organized, and always accessible.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 transition-all duration-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Start using Ogo Pay today. It's fast, free, and built for your everyday needs.</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <button onClick={() => openAuthModal('register')} className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all flex items-center gap-2 justify-center">
              <CheckCircle className="h-5 w-5" /> Create Free Account
            </button>
            <button onClick={() => openAuthModal('login')} className="bg-white dark:bg-secondary-700 border border-primary-600 text-primary-700 dark:text-primary-300 font-semibold px-6 py-3 rounded-lg shadow hover:bg-primary-50 dark:hover:bg-secondary-800 transition-all flex items-center gap-2 justify-center">
              <LogIn className="h-5 w-5" /> Login Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900/90 backdrop-blur text-gray-200 py-12 px-4 mt-auto border-t border-secondary-800 transition-all duration-500">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
          {/* Logo & Tagline */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-extrabold text-2xl text-primary-200">Ogo Pay</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">Smart Personal Lending. Powered by <a href="https://ogotechnology.net" target="_blank" rel="noopener noreferrer" className="hover:text-primary-300 no-underline">Ogo Technology</a>. Manage your financial circle with confidence.</p>
          </div>
          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-primary-300 mb-3">Navigation</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li><ScrollLink to="how" smooth={true} duration={600} offset={-80} className="cursor-pointer hover:text-primary-400 transition-colors">How it Works</ScrollLink></li>
              <li><ScrollLink to="features" smooth={true} duration={600} offset={-80} className="cursor-pointer hover:text-primary-400 transition-colors">Features</ScrollLink></li>
              <li><ScrollLink to="why" smooth={true} duration={600} offset={-80} className="cursor-pointer hover:text-primary-400 transition-colors">Why Ogo Pay</ScrollLink></li>
              <li><button onClick={() => navigate('/contact')} className="cursor-pointer hover:text-primary-400 transition-colors bg-transparent p-0 text-left">Contact</button></li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-primary-300 mb-3">Contact</h4>
            <ul className="text-sm flex flex-col gap-2">
              <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary-400" /> support@ogopay.com</li>
              <li className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary-400" /> +1 234 567 8901</li>
            </ul>
          </div>
          {/* Newsletter Signup */}
          <div>
            <h4 className="font-semibold text-primary-300 mb-3">Newsletter</h4>
            <form className="flex flex-col gap-2">
              <input type="email" placeholder="Your email address" className="px-3 py-2 rounded-lg bg-secondary-800 text-gray-100 border border-secondary-700 focus:ring-2 focus:ring-primary-400 outline-none transition-all" />
              <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-all flex items-center gap-2 justify-center active:scale-95">Subscribe</button>
            </form>
            <p className="text-xs text-gray-500 mt-2">Get updates and news from Ogo Pay.</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mt-10 pt-6 border-t border-secondary-800">
          <div className="text-xs text-gray-400">© 2025 <a href="https://ogotechnology.net" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 no-underline font-semibold">Ogo Technology</a>. All rights reserved.</div>
          <div className="flex gap-4 text-lg">
            <a href="#" aria-label="Twitter" className="hover:text-primary-400 transition-transform transform hover:scale-110"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 8.99 4.07 7.13 1.64 4.15c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.82 1.92 3.6-.7-.02-1.36-.21-1.94-.53v.05c0 2.1 1.5 3.85 3.5 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.6 8.6 0 0 1 2 19.54c-.29 0-.57-.02-.85-.05A12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 22.46 6z" /></svg></a>
            <a href="#" aria-label="Facebook" className="hover:text-primary-400 transition-transform transform hover:scale-110"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.324-.592 1.324-1.326V1.326C24 .592 23.405 0 22.675 0" /></svg></a>
            <a href="#" aria-label="Mail" className="hover:text-primary-400 transition-transform transform hover:scale-110"><MessageCircle className="h-5 w-5" /></a>
          </div>
          <div className="flex gap-4 text-xs">
            <button onClick={() => setModal('terms')} className="hover:underline focus:outline-none">Terms</button>
            <button onClick={() => setModal('privacy')} className="hover:underline focus:outline-none">Privacy</button>
            <button onClick={() => navigate('/contact')} className="hover:underline focus:outline-none">Contact</button>
          </div>
        </div>
      </footer>
      {/* Modal Popups */}
      {['terms', 'privacy', 'contact'].includes(modal as string) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white/80 dark:bg-secondary-800/80 border-t-4 border-primary-500 rounded-2xl shadow-2xl p-0 max-w-xs sm:max-w-sm w-full relative flex flex-col items-center backdrop-blur-lg"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-xl font-bold focus:outline-none">&times;</button>
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex flex-col items-center pt-6 pb-2 px-6">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-6 w-6 text-primary-500" />
                  <span id="modal-title" className="text-lg sm:text-xl font-bold text-primary-700 dark:text-primary-300 text-center">
                    {modal === 'terms' && (<span>Welcome to Ogo Pay — by <a href="https://ogotechnology.net" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-400">Ogo Technology</a></span>)}
                    {modal === 'privacy' && 'Privacy Policy (Ogo Pay)'}
                    {modal === 'contact' && 'Contact Us'}
                  </span>
                </div>
              </div>
              <div className="w-full px-6 pb-6 pt-2 text-gray-700 dark:text-gray-200 text-sm space-y-5">
                {modal === 'terms' && (
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2 font-semibold text-primary-600 border-b border-primary-100 pb-1"><User className="h-4 w-4" /> User Responsibilities</div>
                  <ul className="list-disc ml-5 text-xs">
                    <li>Be honest — use real info and keep your login safe.</li>
                    <li>You're responsible for what you add or track in your account.</li>
                  </ul>
                  <div className="flex items-center gap-2 font-semibold text-primary-600 border-b border-primary-100 pb-1"><ClipboardList className="h-4 w-4" /> Our Role</div>
                  <ul className="list-disc ml-5 text-xs">
                    <li>We help you manage loan records between you and your friends.</li>
                    <li>We don’t move money or act as a bank — we just organize your data.</li>
                  </ul>
                  <div className="flex items-center gap-2 font-semibold text-primary-600 border-b border-primary-100 pb-1"><Ban className="h-4 w-4" /> Don’ts</div>
                  <ul className="list-disc ml-5 text-xs">
                    <li>Don’t misuse the system or access accounts that aren’t yours.</li>
                    <li>Don’t use Ogo Pay for illegal or fraudulent activities.</li>
                  </ul>
                  <div className="flex items-center gap-2 font-semibold text-primary-600 border-b border-primary-100 pb-1"><AlertTriangle className="h-4 w-4" /> Account Suspension</div>
                  <ul className="list-disc ml-5 text-xs">
                    <li>We may pause or close accounts if you break the rules or harm the system.</li>
                  </ul>
                  <div className="flex items-center gap-2 font-semibold text-primary-600 border-b border-primary-100 pb-1"><Mail className="h-4 w-4" /> Need Help?</div>
                  <p className="text-xs">Email us anytime at <a href="mailto:support@ogotechnology.com" className="text-primary-600 underline">support@ogotechnology.com</a> if you have questions.</p>
                </div>
                )}
                {modal === 'privacy' && (
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2 font-semibold text-primary-600 border-b border-primary-100 pb-1"><Lock className="h-4 w-4" /> Your privacy matters to us.</div>
                  <div className="flex items-center gap-2 font-semibold text-primary-600 border-b border-primary-100 pb-1"><ClipboardList className="h-4 w-4" /> What We Collect</div>
                  <ul className="list-disc ml-5 text-xs">
                    <li>Your name, email, and login info</li>
                    <li>Loan and repayment data you add</li>
                    <li>Login time, IP address, and basic usage analytics</li>
                  </ul>
                  <div className="flex items-center gap-2 font-semibold text-primary-600 border-b border-primary-100 pb-1"><Server className="h-4 w-4" /> How We Use It</div>
                  <ul className="list-disc ml-5 text-xs">
                    <li>To run your account and show loan balances</li>
                    <li>To improve features and notify you about updates</li>
                    <li>We don’t sell or share your data</li>
                  </ul>
                  <div className="flex items-center gap-2 font-semibold text-primary-600 border-b border-primary-100 pb-1"><CheckCircle className="h-4 w-4" /> Your Choices</div>
                  <ul className="list-disc ml-5 text-xs">
                    <li>You can view, update, or delete your data anytime.</li>
                    <li>Want your data exported or your account closed? Just ask.</li>
                  </ul>
                  <div className="flex items-center gap-2 font-semibold text-primary-600 border-b border-primary-100 pb-1"><Shield className="h-4 w-4" /> Data Security</div>
                  <ul className="list-disc ml-5 text-xs">
                    <li>We use encryption and security best practices to protect your info.</li>
                  </ul>
                  <div className="flex items-center gap-2 font-semibold text-primary-600 border-b border-primary-100 pb-1"><Info className="h-4 w-4" /> Still have questions?</div>
                  <p className="text-xs">Reach out at <a href="mailto:support@ogotechnology.com" className="text-primary-600 underline">support@ogotechnology.com</a></p>
                </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* Login/Register Modal */}
      <LoginRegisterModal
        open={modal === 'login' || modal === 'register'}
        mode={authMode}
        onClose={() => setModal(null)}
        onSwitchMode={m => { setAuthMode(m); setModal(m); }}
      />
      {/* Back to Top Button */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-40 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg border-2 border-primary-200 dark:border-secondary-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <ChevronsUp className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-secondary-900 w-64 max-w-full h-full shadow-2xl flex flex-col p-6 relative"
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <button
                className="absolute top-4 right-4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-primary-700 dark:text-primary-200" />
              </button>
              <nav className="flex flex-col gap-6 mt-10 text-lg font-semibold">
                <ScrollLink to="how" smooth={true} duration={600} offset={-80} onClick={() => setSidebarOpen(false)} className="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">How it Works</ScrollLink>
                <ScrollLink to="features" smooth={true} duration={600} offset={-80} onClick={() => setSidebarOpen(false)} className="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">Features</ScrollLink>
                <ScrollLink to="why" smooth={true} duration={600} offset={-80} onClick={() => setSidebarOpen(false)} className="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">Why Ogo Pay</ScrollLink>
                <button onClick={() => { setSidebarOpen(false); navigate('/contact'); }} className={`text-left cursor-pointer font-semibold transition-transform ${location.pathname === '/contact' ? 'text-primary-600 dark:text-primary-400 scale-105' : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400'}`}>Contact</button>
                <button onClick={() => { setSidebarOpen(false); navigate('/blog'); }} className="text-left cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">Blog</button>
                <hr className="my-2 border-secondary-200 dark:border-secondary-700" />
                <button onClick={() => { setSidebarOpen(false); openAuthModal('login'); }} className="text-left cursor-pointer text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-secondary-800 rounded-lg px-3 py-2">Login</button>
                <button onClick={() => { setSidebarOpen(false); openAuthModal('register'); }} className="text-left cursor-pointer bg-primary-600 text-white hover:bg-primary-700 rounded-lg px-3 py-2">Get Started</button>
                <button onClick={toggleTheme} aria-label="Toggle dark mode" className="mt-4 rounded-lg p-2 bg-primary-50 dark:bg-secondary-800 hover:bg-primary-100 dark:hover:bg-secondary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 self-start">
                  {isDark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-primary-700" />}
                </button>
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage; 