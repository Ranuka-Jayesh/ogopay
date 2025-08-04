import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { generateTrackingUrl } from '../../utils/trackingUrl';
import { UserPlus, Check, X, Phone } from 'lucide-react';

interface AddFriendProps {
  onSuccess?: () => void;
}

export const AddFriend: React.FC<AddFriendProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (!user) {
        setError('You must be logged in to add friends.');
        return;
      }

      // Generate unique tracking URL
      const trackingUrl = generateTrackingUrl();
      
      // Insert friend into database
      const { error } = await supabase
        .from('friends')
        .insert([
          {
            full_name: name.trim(),
            whatsapp_number: whatsappNumber.trim(),
            admin_id: user.id,
            is_registered: false,
            tracking_url: trackingUrl
          }
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setError('A friend with this WhatsApp number already exists.');
        } else {
          setError('Failed to add friend. Please try again.');
        }
        console.error('Database error:', error);
      } else {
        setSuccess('Friend added successfully!');
        setName('');
        setWhatsappNumber('');
        
        // Auto-close modal after a short delay
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Add friend error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <UserPlus className="h-8 w-8 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Friend</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Add a friend to start tracking loans</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="friendName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="friendName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-gray-900 dark:text-white"
            placeholder="Enter friend's full name"
            required
          />
        </div>

        <div>
          <label htmlFor="friendWhatsApp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            WhatsApp Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="tel"
              id="friendWhatsApp"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-gray-900 dark:text-white"
              placeholder="Enter WhatsApp number"
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm">
            <X className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg text-sm">
            <Check className="h-4 w-4" />
            <span>{success}</span>
            <div className="text-xs text-green-600 dark:text-green-300 mt-1">
              Modal will close automatically...
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !name.trim() || !whatsappNumber.trim()}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Adding Friend...' : 'Add Friend'}
        </button>
      </form>
    </div>
  );
};