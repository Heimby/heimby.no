import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import mediaData from '../data/mediaArticles.json';

// Fisher-Yates, on a copy so the imported JSON stays untouched.
const shuffle = (items) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const MediaSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Shuffled once per mount via the lazy initializer, so the order stays put
  // while the carousel is being used instead of reshuffling on every render.
  const [mediaArticles] = useState(() => shuffle(mediaData.articles));

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaArticles.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaArticles.length) % mediaArticles.length);
  };

  const visibleCards = 4;
  const getVisibleArticles = () => {
    const visible = [];
    for (let i = 0; i < visibleCards; i++) {
      visible.push(mediaArticles[(currentIndex + i) % mediaArticles.length]);
    }
    return visible;
  };

  return (
    <section className="relative py-24 px-6" style={{ backgroundColor: '#F9F8F4' }}>
      <div className="mx-auto" style={{ maxWidth: '95%' }}>
        {/* Heading */}
        <div className="text-center mb-12 space-y-4 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">
            Heimby i media
          </h2>
          <p className="text-xl text-gray-700 font-light">
            NRK, TV 2, Bergensavisen, Nettavisen og Firdaposten om korttidsutleie
          </p>
          <p className="text-base text-gray-600 font-light leading-relaxed pt-4">
            Vi er omtalt som Bergens største aktør på korttidsutleie, og vi stiller i debatten
            om korttidsutleie og skyggehoteller når den kommer opp. Her er sakene — også de som er
            kritiske til oss — med kort sammendrag og lenke til hele artikkelen.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative mt-16">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors duration-300"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors duration-300"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>

          {/* Cards Container - Desktop */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 px-8">
            {getVisibleArticles().map((article, index) => {
              return (
                <Link
                  key={index}
                  to={`/nyheter/${article.slug}`}
                  className="relative shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                  style={{ aspectRatio: '3/4' }}
                >
                  {/* Background Image */}
                  <img
                    src={article.image}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  
                  {/* External Link Icon */}
                  <div className="absolute top-3 right-3 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-4 h-4 text-gray-900" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-5">
                    <div className="text-xs text-white/70 font-medium mb-1">
                      {article.source}
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-white/90 leading-relaxed font-light line-clamp-3">
                      {article.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Cards Container - Mobile (single card) */}
          <div className="md:hidden px-8">
            {mediaArticles.map((article, index) => {
              return (
                <Link
                  key={index}
                  to={`/nyheter/${article.slug}`}
                  className={`relative shadow-lg transition-all duration-300 overflow-hidden ${
                    index === currentIndex ? 'block' : 'hidden'
                  }`}
                  style={{ aspectRatio: '3/4' }}
                >
                  {/* Background Image */}
                  <img
                    src={article.image}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  
                  {/* External Link Icon */}
                  <div className="absolute top-3 right-3 bg-white/90 rounded-full p-2">
                    <ArrowRight className="w-4 h-4 text-gray-900" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-5">
                    <div className="text-xs text-white/70 font-medium mb-1">
                      {article.source}
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-white/90 leading-relaxed font-light line-clamp-3">
                      {article.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {mediaArticles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-gray-900 w-8' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MediaSection;
