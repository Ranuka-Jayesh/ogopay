import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, ArrowRight, Sun, Moon, Smartphone, Shield, ClipboardList, Ban, AlertTriangle, Mail, Lock, CheckCircle, Info, Server, ChevronsUp, Menu, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [showTop, setShowTop] = React.useState(false);
  const [openPost, setOpenPost] = React.useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

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
    // Show/hide back to top button
    const onScroll = () => {
      setShowTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollToTop = () => {
    const anyWindow = window as any;
    if (anyWindow.lenis) {
      anyWindow.lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
              <li><button onClick={() => navigate('/contact')} className="cursor-pointer hover:text-primary-400 transition-colors bg-transparent p-0 text-left">Contact</button></li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-primary-300 mb-3">Contact</h4>
            <ul className="text-sm flex flex-col gap-2">
              <li className="flex items-center gap-2"><User className="h-4 w-4 text-primary-400" /> support@ogopay.com</li>
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