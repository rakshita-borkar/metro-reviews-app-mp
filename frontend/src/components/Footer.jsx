import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-blue-400">About Metro Reviews</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Providing real commuter insights and ratings for metro systems. Help others make informed decisions about their daily commute.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-blue-400">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition">
                  Home
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-400 hover:text-white transition">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition">
                  About
                </a>
              </li>
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-blue-400">Contact</h3>
            <p className="text-gray-400 text-sm">
              <span className="block mb-2">Email: info@metroreviews.com</span>
              <span className="block">Phone: +91 (800) METRO-HELP</span>
            </p>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-blue-400">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="/" className="text-gray-400 hover:text-white transition text-2xl">
                f
              </a>
              <a href="/" className="text-gray-400 hover:text-white transition text-2xl">
                𝕏
              </a>
              <a href="/" className="text-gray-400 hover:text-white transition text-2xl">
                in
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Metro Reviews. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a href="/" className="hover:text-white transition">
                Privacy Policy
              </a>
              <a href="/" className="hover:text-white transition">
                Terms of Service
              </a>
              <a href="/" className="hover:text-white transition">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
