import React from 'react';

export default function AboutSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Image */}
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src="/images/about-metro.jpg"
              alt="Metro station"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right side - Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About Metro Reviews
            </h2>
            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              Metro Reviews is a community-driven platform dedicated to helping commuters share honest feedback about their metro system experiences.
            </p>
            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              Using advanced AI technology, we analyze reviews across 9 different aspects including cleanliness, safety, service quality, crowd management, and more. This comprehensive analysis helps you understand what other commuters think about specific stations and lines.
            </p>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Our mission is to bridge the gap between commuters and metro operators, providing valuable data-driven insights that can lead to service improvements and better commuter experiences.
            </p>

            {/* Key points */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-2xl text-blue-600">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Transparent Feedback</h3>
                  <p className="text-gray-600 text-sm">All reviews are verified and authentic</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl text-blue-600">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">AI-Powered Analysis</h3>
                  <p className="text-gray-600 text-sm">Machine learning identifies key aspects automatically</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl text-blue-600">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Real-Time Updates</h3>
                  <p className="text-gray-600 text-sm">Latest reviews and ratings available instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
