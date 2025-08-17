
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { useAppData } from '../context/DataContext';

const Sidebar: React.FC = () => {
  const { setupRequired } = useAppData();

  return (
    <aside className="bg-gray-800 text-gray-300 w-20 lg:w-64 flex flex-col transition-all duration-300">
      <div className="bg-gray-900 h-20 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <h1 className="text-xl font-bold hidden lg:block ml-3">ManuSys AI</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors duration-200 justify-center lg:justify-start ${
                isActive
                  ? 'bg-teal-500 text-white'
                  : 'hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            {link.icon}
            <span className="ml-4 hidden lg:block font-semibold">{link.label}</span>
          </NavLink>
        ))}
         {setupRequired && (
            <div className="pt-4 mt-4 border-t border-gray-700">
                 <NavLink
                    to="/setup"
                    className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg transition-colors duration-200 justify-center lg:justify-start relative ${
                        isActive
                        ? 'bg-yellow-600 text-white'
                        : 'bg-yellow-800/50 hover:bg-yellow-700/80 text-white'
                    }`
                    }
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                    <span className="ml-4 hidden lg:block font-semibold">Database Setup</span>
                     <span className="absolute top-2 right-2 h-3 w-3 bg-red-500 rounded-full lg:hidden border-2 border-gray-800"></span>
                     <span className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-3 h-3 w-3 bg-red-500 rounded-full border-2 border-gray-800"></span>
                </NavLink>
            </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
