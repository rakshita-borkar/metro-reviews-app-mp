import React from 'react';

export default function FeaturesSection() {
  const features = [
    {
      icon: '⭐',
      title: 'Real Ratings',
      description: 'Honest reviews from everyday commuters about their metro experience.',
    },
    {
      icon: '🔍',
      title: 'Detailed Analysis',
      description: 'AI-powered aspect analysis covering cleanliness, safety, service, and more.',
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'View comprehensive statistics and trends for every metro station.',
    },
    {
      icon: '🚇',
      title: 'All Stations Covered',
      description: 'Reviews and ratings for all major metro lines and stations.',
    },
    {
      icon: '💬',
      title: 'Community Insights',
      description: 'Join thousands of commuters sharing their daily experiences.',
    },
    {
      icon: '🎯',
      title: 'Data-Driven Improvements',
      description: 'Help metro operators improve services based on real feedback.',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Metro Reviews?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We provide comprehensive, real-time feedback from commuters to help you understand and navigate the metro system better.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
