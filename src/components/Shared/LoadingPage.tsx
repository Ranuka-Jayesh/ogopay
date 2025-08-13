import React from 'react';
import { motion } from 'framer-motion';

interface LoadingPageProps {
  onLoadingComplete: () => void;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ onLoadingComplete }) => {
  React.useEffect(() => {
    // Set consistent tab title during loading
    document.title = 'Ogo Pay — Smart Personal Lending Tracker | Loans, Repayments, PDF Statements';
  }, []);

  React.useEffect(() => {
    // Simulate loading time and then call onLoadingComplete
    const timer = setTimeout(() => {
      onLoadingComplete();
    }, 3000); // 3 seconds loading time

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: '#222222' }}
    >
      <div className="text-center">
        <motion.img
          src="/loading.gif"
          alt="Loading..."
          className="mx-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            delay: 0.2
          }}
        />
      </div>
    </motion.div>
  );
};

export default LoadingPage;
