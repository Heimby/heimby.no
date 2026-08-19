import React from 'react';

const HeroSection = () => {
  const scrollToLeadGen = () => {
    const leadGenSection = document.getElementById('lead-gen');
    if (leadGenSection) {
      leadGenSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://customer-assets.emergentagent.com/job_homeeasy-app/artifacts/mgfizfzg__repeat_3_extreme_image.jpeg"
          alt="Moderne Eiendomsforvaltning"
          className="w-full h-full object-cover hero-background-image"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
      </div>

      <div className="relative h-full flex items-center justify-center">
        <div className="text-center space-y-6 px-6 sm:px-8">
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight leading-tight">
              Korttidsutleie og Airbnb-forvaltning i Norge
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 font-light tracking-wide max-w-3xl mx-auto px-4">
              Vi håndterer annonsering, prising, gjester, renhold og vedlikehold — du beholder full kontroll.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <button 
              onClick={scrollToLeadGen}
              className="group relative px-8 py-3.5 bg-white text-black rounded-full text-sm sm:text-base font-medium transition-all duration-300 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              <span className="relative z-10">Kom i gang</span>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;