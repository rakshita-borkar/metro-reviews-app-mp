import React from 'react';
import HeroCarousel from './HeroCarousel';
import FeaturesSection from './FeaturesSection';
import AboutSection from './AboutSection';
import CTASection from './CTASection';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero Carousel */}
      <div className="mb-8">
        <HeroCarousel />
      </div>

      {/* Features Section */}
      <FeaturesSection />

      {/* About Section */}
      <AboutSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
