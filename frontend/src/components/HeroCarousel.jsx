import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: 'Experience the Metro',
      subtitle: 'Discover what real commuters think about your daily commute',
      image: '/images/metro1.jpg',
      cta: 'Get Started',
      action: () => navigate('/dashboard'),
    },
    {
      title: 'Real Reviews from Real Commuters',
      subtitle: 'Honest ratings on cleanliness, safety, crowd management, and service quality',
      image: '/images/metro2.jpg',
      cta: 'View Reviews',
      action: () => navigate('/dashboard'),
    },
    {
      title: 'Make Your Commute Better',
      subtitle: 'Share your experience and help thousands of commuters make informed decisions',
      image: '/images/metro3.jpg',
      cta: 'Write Review',
      action: () => navigate('/dashboard'),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-screen md:h-96 overflow-hidden rounded-lg shadow-2xl">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background image */}
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              {slide.title}
            </h1>
            <p className="text-lg md:text-2xl mb-8 drop-shadow-md max-w-2xl">
              {slide.subtitle}
            </p>
            <button 
              onClick={slide.action}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition transform hover:scale-105 shadow-lg"
            >
              {slide.cta}
            </button>
          </div>
        </div>
      ))}

      {/* Navigation buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
