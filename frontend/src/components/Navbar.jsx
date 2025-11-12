import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition">
            <div className="bg-white text-blue-700 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
              M
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold">Metro Reviews</div>
              <div className="text-xs text-blue-200">Real Commuter Insights</div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-blue-200 transition duration-200">
              Home
            </Link>
            <Link to="/dashboard" className="hover:text-blue-200 transition duration-200">
              Dashboard
            </Link>
            <Link to="/about" className="hover:text-blue-200 transition duration-200">
              About
            </Link>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/"
              className="block px-4 py-2 hover:bg-blue-600 rounded transition"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="block px-4 py-2 hover:bg-blue-600 rounded transition"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/about"
              className="block px-4 py-2 hover:bg-blue-600 rounded transition"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 bg-white text-blue-700 rounded font-semibold hover:bg-blue-100 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
