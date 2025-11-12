import React from 'react';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="py-16 bg-blue-700 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Share Your Experience?
        </h2>
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Join our community of commuters and help shape the future of public transportation. Your feedback matters!
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-lg hover:bg-blue-50 transition transform hover:scale-105 shadow-lg"
        >
          Get Started Now
        </Link>
      </div>
    </section>
  );
}
