import React from 'react';

export default function StatsSection() {
  const stats = [
    {
      number: '50K+',
      label: 'Reviews',
      description: 'Real commuter feedback',
    },
    {
      number: '100+',
      label: 'Stations',
      description: 'Covered across the network',
    },
    {
      number: '9',
      label: 'Aspects',
      description: 'Analyzed per review',
    },
    {
      number: '1M+',
      label: 'Commuters',
      description: 'Trust our platform',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Commuters Worldwide
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Our platform is powered by real feedback from millions of daily commuters.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl md:text-6xl font-bold mb-2">{stat.number}</div>
              <div className="text-2xl font-semibold mb-2">{stat.label}</div>
              <p className="text-blue-100">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
