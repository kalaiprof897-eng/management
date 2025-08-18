
import React from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const currentLink = NAV_LINKS.find(link => link.path === location.pathname);
  const title = currentLink ? currentLink.label : (location.pathname === '/setup' ? 'Database Setup' : 'Dashboard');

  return (
    <header className="bg-gray-800 shadow-md h-20 flex items-center justify-between px-8">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">3</span>
        </div>
        <div className="flex items-center space-x-3">
            <div className="text-right">
                <p className="text-sm font-semibold text-white">{user?.email}</p>
            </div>
            <button 
              onClick={signOut}
              className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-label="Sign out"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;