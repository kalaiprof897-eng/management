
import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true); // Trigger fade-in
    const timer = setTimeout(() => {
      setVisible(false); // Trigger fade-out
      setTimeout(onClose, 500); // Call onClose after fade-out transition
    }, 4000); // Show for 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = 'fixed top-24 right-8 p-4 rounded-lg shadow-xl text-white font-semibold transition-all duration-500 transform z-50 flex items-center space-x-3';
  const visibilityClasses = visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12';

  const typeClasses = type === 'success'
    ? 'bg-green-500'
    : 'bg-red-500';

  const Icon = type === 'success' ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className={`${baseClasses} ${typeClasses} ${visibilityClasses}`}>
      {Icon}
      <span>{message}</span>
    </div>
  );
};

export default Notification;