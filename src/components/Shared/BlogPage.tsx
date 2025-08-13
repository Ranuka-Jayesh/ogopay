import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, ArrowRight, Sun, Moon, Smartphone, Shield, ClipboardList, Ban, AlertTriangle, Mail, Lock, CheckCircle, Info, Server, Menu, X, MessageCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Chatbot } from './Chatbot';
import Lenis from '@studio-freight/lenis';

const posts = [
  {
    id: 1,
    title: 'How to Manage Loans with Friends Like a Pro',
    summary: 'Discover the best practices for tracking personal loans and repayments with Ogo Pay.',
    author: 'Jane Doe',
    date: '2024-07-01',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80',
    featured: true,
  },
  {
    id: 2,
    title: '5 Tips for Staying Financially Organized',
    summary: 'Simple habits to keep your finances in check and avoid awkward conversations.',
    author: 'John Smith',
    date: '2024-06-20',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Why Digital Loan Tracking Beats Spreadsheets',
    summary: 'See how Ogo Pay makes loan management easier and more secure than old-school methods.',
    author: 'Priya Patel',
    date: '2024-06-10',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'The Psychology of Lending Money to Friends',
    summary: 'Understand the emotional side of personal loans and how to keep relationships strong.',
    author: 'Alex Lee',
    date: '2024-05-28',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  },
];

const BlogPage: React.FC = () => {
  const featured = posts.find(p => p.featured);
  const others = posts.filter(p => !p.featured);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [modal, setModal] = React.useState<null | 'terms' | 'privacy'>(null);
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  const [openPost, setOpenPost] = React.useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);



  React.useEffect(() => {
    // SEO/tab title (match Landing)
    const prev = document.title;
    const title = 'Ogo Pay — Smart Personal Lending Tracker | Loans, Repayments, PDF Statements';
    document.title = title;
    const upsert = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    upsert('description', 'Ogo Pay blog: tips and insights on tracking loans and repayments securely.');
    upsert('keywords', 'Ogo Pay, blog, personal lending, loan tracker, ogotechnology');
    const upsertOG = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    upsertOG('og:title', title);
    upsertOG('og:description', 'Track loans and repayments securely with Ogo Pay. Read insights on our blog.');
    upsertOG('og:image', '/logo.jpg');
    return () => { document.title = prev; };
  }, []);

  React.useEffect(() => {
    // Enable Lenis smooth scrolling on all screen sizes
    let lenis: any = null;
    if (typeof window !== 'undefined') {
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

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const navigateAndScroll = (section?: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        if (section) window.location.hash = section;
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      if (section) {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Help center functions


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-100 dark:from-secondary-900 dark:to-secondary-800 flex flex-col">
      {/* Header (identical to LandingPage) */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="sticky top-0 z-30 w-full backdrop-blur bg-white/70 dark:bg-secondary-900/80 shadow-md border-b border-primary-100 dark:border-secondary-800"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <button onClick={() => navigateAndScroll()} className="flex items-center gap-2 font-extrabold text-xl text-primary-700 dark:text-primary-300 focus:outline-none">
            Ogo Pay
          </button>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 text-base font-medium">
            <button onClick={() => navigateAndScroll('how')} className="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-semibold px-2">How it Works</button>
            <button onClick={() => navigateAndScroll('features')} className="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-semibold px-2">Features</button>
            <button onClick={() => navigateAndScroll('why')} className="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-semibold px-2">Why Ogo Pay</button>
            <button
              onClick={() => navigate('/contact')}
              className={`cursor-pointer font-semibold px-2 transition-transform ${location.pathname === '/contact' ? 'text-primary-600 dark:text-primary-400 scale-105' : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400'}`}
            >
              Contact
            </button>
            <button
              onClick={() => navigate('/blog')}
              className="cursor-pointer text-primary-600 dark:text-primary-400 font-semibold px-2 scale-105"
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
          {/* Theme Toggle & Auth Buttons (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-2">
            <button onClick={toggleTheme} aria-label="Toggle dark mode" className="rounded-lg p-2 bg-primary-50 dark:bg-secondary-800 hover:bg-primary-100 dark:hover:bg-secondary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400">
              <motion.span key={isDark ? 'moon' : 'sun'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                {isDark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-primary-700" />}
              </motion.span>
            </button>
            <button
              onClick={() => { navigate('/'); setTimeout(() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: 'login' })), 100); }}
              className="px-4 py-2 rounded-lg font-semibold text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-secondary-800 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => { navigate('/'); setTimeout(() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: 'register' })), 100); }}
              className="px-4 py-2 rounded-lg font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-8 text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl sm:text-5xl font-extrabold text-primary-700 dark:text-primary-300 mb-4">
          Ogo Pay Blog
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }} className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
          Insights, tips, and stories to help you master personal lending and financial organization.
        </motion.p>
      </section>

      {/* Featured Post */}
      {featured && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="max-w-4xl mx-auto px-4 mb-12">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group bg-gradient-to-tr from-primary-100/80 to-emerald-200/80 dark:from-secondary-800 dark:to-secondary-700 flex flex-col md:flex-row border border-primary-100 dark:border-secondary-700 cursor-pointer" onClick={() => setOpenPost(featured)}>
            <img src={featured.image} alt={featured.title} className="w-full md:w-2/5 h-56 md:h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary-700 dark:text-primary-200 mb-2 group-hover:underline transition-all">{featured.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{featured.summary}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><User className="h-4 w-4" /> {featured.author}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {featured.date}</span>
              </div>
            </div>
            <span className="absolute bottom-4 right-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 shadow-lg flex items-center transition-all group-hover:scale-110">
              <ArrowRight className="h-5 w-5" />
            </span>
          </div>
        </motion.div>
      )}

      {/* Blog Grid */}
      <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {others.map(post => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: post.id * 0.1 }}
            className="bg-white/90 dark:bg-secondary-800/90 rounded-2xl shadow-xl overflow-hidden flex flex-col group hover:shadow-2xl transition-all border border-primary-100 dark:border-secondary-700 relative cursor-pointer"
            onClick={() => setOpenPost(post)}
          >
            <img src={post.image} alt={post.title} className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-primary-700 dark:text-primary-200 mb-1 group-hover:underline transition-all">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{post.summary}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-auto">
                <span className="flex items-center gap-1"><User className="h-4 w-4" /> {post.author}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {post.date}</span>
              </div>
            </div>
            <span className="absolute bottom-4 right-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 shadow-lg flex items-center transition-all group-hover:scale-110">
              <ArrowRight className="h-4 w-4" />
            </span>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900/90 backdrop-blur text-gray-200 py-12 px-4 mt-auto border-t border-secondary-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
          {/* Logo & Tagline */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-extrabold text-2xl text-primary-200">Ogo Pay</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">Smart Personal Lending. Powered by Ogo Technology. Manage your financial circle with confidence.</p>
          </div>
          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-primary-300 mb-3">Navigation</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li><button onClick={() => navigateAndScroll('how')} className="cursor-pointer hover:text-primary-400 transition-colors bg-transparent p-0 text-left">How it Works</button></li>
              <li><button onClick={() => navigateAndScroll('features')} className="cursor-pointer hover:text-primary-400 transition-colors bg-transparent p-0 text-left">Features</button></li>
              <li><button onClick={() => navigateAndScroll('why')} className="cursor-pointer hover:text-primary-400 transition-colors bg-transparent p-0 text-left">Why Ogo Pay</button></li>
              <li><button onClick={() => navigate('/blog')} className="cursor-pointer hover:text-primary-400 transition-colors bg-transparent p-0 text-left">Blog</button></li>
              <li><button onClick={() => navigate('/contact')} className="cursor-pointer hover:text-primary-400 transition-colors bg-transparent p-0 text-left">Contact</button></li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-primary-300 mb-3">Contact</h4>
            <ul className="text-sm flex flex-col gap-2">
              <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary-400" /> ogopay@ogotechnology.net</li>
              <li className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary-400" /> +94 75 930 7059</li>
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
            <a href="https://www.instagram.com/ogotechnology/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary-400 transition-transform transform hover:scale-110">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://web.facebook.com/people/ogo-technology/61577853584341/?rdid=pHP2MbuImuP0VgF7&share_url=https://web.facebook.com/share/19FN4eNbcN/?_rdc=1&_rdr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-primary-400 transition-transform transform hover:scale-110">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.324-.592 1.324-1.326V1.326C24 .592 23.405 0 22.675 0"/>
              </svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-primary-400 transition-transform transform hover:scale-110">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-primary-400 transition-transform transform hover:scale-110">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </a>
            <a href="https://www.pinterest.com/ogo_technology/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="hover:text-primary-400 transition-transform transform hover:scale-110">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
              </svg>
            </a>
          </div>
          <div className="flex gap-4 text-xs">
            <button className="hover:underline bg-transparent p-0" onClick={() => setModal('terms')} >Terms</button>
            <button className="hover:underline bg-transparent p-0" onClick={() => setModal('privacy')} >Privacy</button>
            <button className="hover:underline bg-transparent p-0" onClick={() => navigate('/contact')} >Contact</button>
          </div>
        </div>
      </footer>
      {/* Terms/Privacy Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setModal(null)}
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
              <button onClick={() => setModal(null)} className="absolute top-3 right-3 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-xl font-bold focus:outline-none">&times;</button>
              <div className="w-full flex flex-col items-center">
                <div className="w-full flex flex-col items-center pt-6 pb-2 px-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-6 w-6 text-primary-500" />
                    <span id="modal-title" className="text-lg sm:text-xl font-bold text-primary-700 dark:text-primary-300 text-center">
                      {modal === 'terms' && 'Welcome to Ogo Pay — by Ogo Technology'}
                      {modal === 'privacy' && 'Privacy Policy (Ogo Pay)'}
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
      </AnimatePresence>
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
      {/* Blog View Modal */}
      <BlogViewModal post={openPost} open={!!openPost} onClose={() => setOpenPost(null)} />
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
                <button onClick={() => { setSidebarOpen(false); navigateAndScroll('how'); }} className="text-left cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">How it Works</button>
                <button onClick={() => { setSidebarOpen(false); navigateAndScroll('features'); }} className="text-left cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">Features</button>
                <button onClick={() => { setSidebarOpen(false); navigateAndScroll('why'); }} className="text-left cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">Why Ogo Pay</button>
                <button onClick={() => { setSidebarOpen(false); navigate('/contact'); }} className={`text-left cursor-pointer font-semibold transition-transform ${location.pathname === '/contact' ? 'text-primary-600 dark:text-primary-400 scale-105' : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400'}`}>Contact</button>
                <button onClick={() => { setSidebarOpen(false); navigate('/blog'); }} className="text-left cursor-pointer text-primary-600 dark:text-primary-400 font-semibold scale-105">Blog</button>
                <hr className="my-2 border-secondary-200 dark:border-secondary-700" />
                <button onClick={() => { setSidebarOpen(false); navigate('/'); setTimeout(() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: 'login' })), 100); }} className="text-left cursor-pointer text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-secondary-800 rounded-lg px-3 py-2">Login</button>
                <button onClick={() => { setSidebarOpen(false); navigate('/'); setTimeout(() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: 'register' })), 100); }} className="text-left cursor-pointer bg-primary-600 text-white hover:bg-primary-700 rounded-lg px-3 py-2">Get Started</button>
                <button onClick={toggleTheme} aria-label="Toggle dark mode" className="mt-4 rounded-lg p-2 bg-primary-50 dark:bg-secondary-800 hover:bg-primary-100 dark:hover:bg-secondary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 self-start">
                  {isDark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-primary-700" />}
                </button>
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Chatbot Component */}
      <Chatbot 
        showFloatingButton={true}
        position="bottom-left"
        customMessage="Need help with our blog? I'm here to assist you!"
      />
    </div>
  );
};

// Blog View Modal
const BlogViewModal: React.FC<{ post: any, open: boolean, onClose: () => void }> = ({ post, open, onClose }) => {
  if (!open || !post) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative bg-white/90 dark:bg-secondary-900/95 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 p-0 overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-2xl font-bold focus:outline-none z-10">&times;</button>
          <div className="flex flex-col md:flex-row">
            <img src={post.image} alt={post.title} className="w-full md:w-2/5 h-56 md:h-auto object-cover rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none" />
            <div className="flex-1 p-6 flex flex-col">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary-700 dark:text-primary-200 mb-2">{post.title}</h2>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1"><User className="h-4 w-4" /> {post.author}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {post.date}</span>
              </div>
              <div className="text-gray-700 dark:text-gray-200 text-base leading-relaxed max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {post.summary}
                {/* Placeholder for full content. Replace with post.content if available. */}
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">(Full blog content goes here...)</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BlogPage; 