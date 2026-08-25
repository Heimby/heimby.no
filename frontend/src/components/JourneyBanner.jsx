import React from 'react';

const JourneyBanner = () => {
  return (
    <section className="relative py-0 px-0 sm:px-6" style={{ backgroundColor: '#F9F8F4' }}>
      <div className="relative mx-auto" style={{ maxWidth: '100%' }}>
        <img
          src="/img/image.jpg"
          alt="Heimby - Vår reise hittil"
          className="w-full h-auto object-contain"
          style={{ display: 'block' }}
        />
      </div>
    </section>
  );
};

export default JourneyBanner;
