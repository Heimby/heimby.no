import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProfessionalServicesSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const services = [
    {
      title: 'Sertifiserte renholdere',
      description: 'Profesjonelt trente renholdere leverer hotellstandard. Hver rengjøring dokumenteres og verifiseres digitalt.',
      image: 'https://customer-assets.emergentagent.com/job_homeeasy-app/artifacts/vh2we7fs_a_candid_lifestyle_image%20%281%29.jpeg',
    },
    {
      title: 'Vedlikehold & Tekniske tjenester',
      description: 'Lisensierte teknikere håndterer alt fra rutinejobber til akutte reparasjoner. Forebyggende vedlikehold holder eiendommen i god stand.',
      image: 'https://customer-assets.emergentagent.com/job_homeeasy-app/artifacts/i4c1bl7s_a_candid_lifestyle_image.jpeg',
    },
    {
      title: 'Forbruksvarer & Lagerstyring',
      description: 'Automatisk lagersporing og lokale leverandører holder boligen godt utstyrt. Du betaler ikke for mye, og gjestene går aldri tom.',
      image: 'https://customer-assets.emergentagent.com/job_homeeasy-app/artifacts/lmyvu6xn_a_candid_lifestyle_image%20%282%29.jpeg',
    },
    {
      title: 'Sengetøy & Vaskerilogistikk',
      description: 'Glem bryet med vask og brett. Vi håndterer rotasjon av sengetøy og håndklær med profesjonell vaskeriservice for hotellstandard hygiene.',
      image: 'https://customer-assets.emergentagent.com/job_homeeasy-app/artifacts/6z1bkvn0_a_candid_lifestyle_image%20%284%29.jpeg',
    },
    {
      title: 'Lokale spesialister i hvert marked',
      description: 'Fra inspektører til fotografer og leverandører – alle partnere er nøye vurdert og evaluert for å opprettholde Heimbys standard.',
      image: 'https://customer-assets.emergentagent.com/job_homeeasy-app/artifacts/jh9h3rva_a_candid_waist_up_image.jpeg',
    },
    {
      title: '24/7 Kommunikasjon & Analyse',
      description: '24/7 kommunikasjon og prisanalytikere sikrer at eiendommen din presterer best mulig med datadrevne innsikter.',
      image: 'https://customer-assets.emergentagent.com/job_homeeasy-app/artifacts/eci7fzi0_a_candid_lifestyle_image%20%283%29.jpeg',
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % services.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  };

  const visibleCards = 4;
  const getVisibleServices = () => {
    const visible = [];
    for (let i = 0; i < visibleCards; i++) {
      visible.push(services[(currentIndex + i) % services.length]);
    }
    return visible;
  };

  return (
    <section className="relative py-24 px-6" style={{ backgroundColor: '#F9F8F4' }}>
      <div className="mx-auto" style={{ maxWidth: '95%' }}>
        {/* Heading */}
        <div className="text-center mb-12 space-y-4 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">
            Heimbys økosystem
          </h2>
          <p className="text-xl text-gray-700 font-light">
            Renhold, vaktmester, nøkler og vedlikehold — med faste folk i hver by
          </p>
          <p className="text-base text-gray-600 font-light leading-relaxed pt-4">
            Vi bruker faste leverandører vi har jobbet med over tid, ikke tilfeldige innleide. Renhold
            er det som slår hardest ut på gjesteomtaler, og omtaler avgjør hvor høyt boligen ligger i
            søket på Airbnb og Booking.com. Derfor er drift en del av forvaltningen hos oss, ikke noe
            som settes bort når det haster.
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
            {getVisibleServices().map((service, index) => {
              return (
                <div
                  key={index}
                  className="relative shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  style={{ aspectRatio: '3/4' }}
                >
                  {/* Background Image */}
                  <img
                    src={service.image}
                    alt={service.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-5">
                    <h3 className="text-lg font-medium text-white mb-2">
                      {service.title}
                    </h3>
                    <p className="text-xs text-white/90 leading-relaxed font-light line-clamp-3">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cards Container - Mobile (single card) */}
          <div className="md:hidden px-8">
            {services.map((service, index) => {
              return (
                <div
                  key={index}
                  className={`relative shadow-lg transition-all duration-300 overflow-hidden ${
                    index === currentIndex ? 'block' : 'hidden'
                  }`}
                  style={{ aspectRatio: '3/4' }}
                >
                  {/* Background Image */}
                  <img
                    src={service.image}
                    alt={service.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-5">
                    <h3 className="text-lg font-medium text-white mb-2">
                      {service.title}
                    </h3>
                    <p className="text-xs text-white/90 leading-relaxed font-light line-clamp-3">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {services.map((_, index) => (
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

export default ProfessionalServicesSection;

