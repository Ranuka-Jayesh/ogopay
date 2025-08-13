import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom scrollbar styles
const customScrollbarStyles = `
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
`;

interface ChatbotProps {
  isOpen?: boolean;
  onClose?: () => void;
  showFloatingButton?: boolean;
  position?: 'bottom-left' | 'bottom-right';
  customMessage?: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({ 
  isOpen = false, 
  onClose, 
  showFloatingButton = true,
  position = 'bottom-left',
  customMessage = "Need help with your transaction history? I'm here to assist you!"
}) => {
  const [chatMessages, setChatMessages] = useState<Array<{
    id: number;
    type: 'bot' | 'user';
    message: string;
  }>>([
    {
      id: 1,
      type: 'bot',
      message: 'Hi! I\'m your Ogo Pay Assistant. How can I help you today?'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showChatbot, setShowChatbot] = useState(isOpen);
  const [showHelpNotification, setShowHelpNotification] = useState(false);

  // Predefined quick actions (short and sweet)
  const quickActions: Array<{ id: string; label: string; answer: string }> = [
    {
      id: 'delete-transaction',
      label: 'How to delete a transaction?',
      answer:
        'For security, deleting transactions is handled by the system administrator.\n\nContact:\n• Phone: +94 75 930 7059\n• Email: ogopay@ogotechnology.net\n• Web: ogotechnology.net\n\nTip: Share the Transaction ID or date/amount so we can help quickly.'
    },
    {
      id: 'reset-password',
      label: 'How to reset password?',
      answer:
        'If you can login: go to Profile → Security → Change Password.\n\nIf you cannot login: contact your lender/admin to reset your access.\n• Phone: +94 75 930 7059\n• Email: ogopay@ogotechnology.net'
    },
    {
      id: 'intro',
      label: 'What is OgoPay?',
      answer:
        'OgoPay is a simple, secure personal lending tracker by Ogo Technology.\n• Record loans and repayments\n• Share a read‑only tracking link + 4‑digit code\n• Generate PNG slips and export PDF statements\n• Works great in dark and light modes'
    },
    {
      id: 'capabilities',
      label: 'What can I do here?',
      answer:
        'You can:\n• Add/edit friends\n• Record loans or repayments\n• Share tracking URL and access code\n• Filter/search history and download PDF\n• View totals and remaining balance in real time'
    }
  ];

  // Update internal state when external isOpen prop changes
  useEffect(() => {
    setShowChatbot(isOpen);
  }, [isOpen]);

  const openChatbot = () => {
    setShowChatbot(true);
    setShowHelpNotification(false);
    if (onClose) onClose();
  };

  const closeChatbot = () => {
    setShowChatbot(false);
    if (onClose) onClose();
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: chatMessages.length + 1,
        type: 'user' as const,
        message: newMessage
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: chatMessages.length + 2,
          type: 'bot' as const,
          message: 'Thank you for your message! I\'ll get back to you soon.'
        };
        setChatMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const triggerQuickAnswer = (qa: { id: string; label: string; answer: string }) => {
    const nextId = chatMessages.length + 1;
    const userMessage = { id: nextId, type: 'user' as const, message: qa.label };
    setChatMessages(prev => [...prev, userMessage]);
    setTimeout(() => {
      const botResponse = { id: nextId + 1, type: 'bot' as const, message: qa.answer };
      setChatMessages(prev => [...prev, botResponse]);
    }, 300);
  };

  // Show help notification after 3 seconds
  useEffect(() => {
    if (showFloatingButton) {
      const timer = setTimeout(() => {
        setShowHelpNotification(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showFloatingButton]);

  const buttonPosition = position === 'bottom-right' ? 'right-6' : 'left-6';
  const notificationPosition = position === 'bottom-right' ? 'right-6' : 'left-6';

  return (
    <>
      <style>{customScrollbarStyles}</style>
      
      {/* Floating Help Button */}
      {showFloatingButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          onClick={openChatbot}
          className={`fixed bottom-6 ${buttonPosition} z-40 w-16 h-16 bg-transparent rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group`}
          whileHover={{ 
            scale: 1.1, 
            y: -3,
            rotate: [0, -5, 5, 0]
          }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="relative flex items-center justify-center w-full h-full">
            <img src="/bot.gif" alt="Help Bot" className="w-12 h-12 rounded-full" />
            
            {/* Glow Effect */}
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
              className="absolute inset-0 rounded-full bg-blue-400/30 blur-sm"
            />
            
            {/* Pulse Ring */}
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
              className="absolute inset-0 rounded-full border border-blue-400/50"
            />
          </div>
          
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute bottom-full left-0 mb-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            Need Help?
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
          </motion.div>
        </motion.button>
      )}

      {/* Help Notification Popup */}
      <AnimatePresence>
        {showHelpNotification && showFloatingButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0, x: position === 'bottom-right' ? 20 : -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0, x: position === 'bottom-right' ? 20 : -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed bottom-28 ${notificationPosition} z-50 max-w-xs`}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 relative">
              {/* Close button */}
              <button
                onClick={() => setShowHelpNotification(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg font-bold"
              >
                ×
              </button>
              
              {/* Notification content */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <img src="/bot.gif" alt="Help Bot" className="w-12 h-12 rounded-full" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Hi there! 👋
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                    {customMessage}
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openChatbot}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                  >
                    Chat with me
                  </motion.button>
                </div>
              </div>
              
              {/* Arrow pointing to help icon */}
              <div className={`absolute bottom-0 ${position === 'bottom-right' ? 'right-4' : 'left-4'} transform translate-y-full`}>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot Chat Interface */}
      <AnimatePresence>
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-start p-4 pb-32"
            onWheel={(e) => {
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 h-96 flex flex-col"
            >
              {/* Chatbot Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <img src="/bot.gif" alt="Help Bot" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Ogo Pay Assistant</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
                  </div>
                </div>
                <button onClick={closeChatbot} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Chat Messages */}
              <div 
                className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar"
                onWheel={(e) => {
                  e.stopPropagation();
                }}
                onTouchMove={(e) => {
                  e.stopPropagation();
                }}
              >
                {chatMessages.map((message) => (
                  <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
                      {message.message}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Questions (horizontal scroll) + Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {/* Quick actions row */}
                <div className="mb-3 -mx-1">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">
                    {quickActions.map((qa) => (
                      <motion.button
                        key={qa.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => triggerQuickAnswer(qa)}
                        className="shrink-0 px-3 py-2 rounded-full text-xs font-medium border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                        title={qa.label}
                      >
                        {qa.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
                    placeholder="Type your message..." 
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100" 
                  />
                  <button onClick={sendMessage} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
