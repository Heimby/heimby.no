import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const WhatWeAreSection = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const services = [
    {
      title: 'Airbnb-utleie',
      description: 'Vi lager annonsen med profesjonelle bilder, setter prisen løpende etter etterspørsel, svarer gjestene og koordinerer renhold mellom hvert opphold. Du leverer nøklene og ser tallene i eierportalen.'
    },
    {
      title: 'Langtidsutleie',
      description: 'Annonsering, visninger, kredittsjekk av leietaker, kontrakt, innflytting og all løpende kontakt. Du får fast månedlig leie, og vi tar telefonen når leietaker ringer.'
    },
    {
      title: 'Dynamisk (10-2)',
      description: 'Ti måneder på studentkontrakt gir stabil grunninntekt gjennom lavsesongen, og to sommermåneder på Airbnb tar ut inntektstoppen. Modellen holder deg samtidig innenfor 90-dagersgrensen i eierseksjonsloven § 24. Dette er modellen vi bruker for flest boliger i Bergen.'
    }
  ];

  return (
    <section className="relative py-0 px-0 sm:px-6" style={{ backgroundColor: '#F9F8F4' }}>
      <div className="relative min-h-[600px] mx-auto sm:mx-auto" style={{ maxWidth: '100%', '--tw-max-width': '95%' }}>
        <img
          src="https://customer-assets.emergentagent.com/job_neo-copier/artifacts/6utvdueb_the_image_carries_image.jpeg"
          alt="Property Management"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative max-w-6xl mx-auto py-16 px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="rounded-2xl shadow-2xl p-8 md:p-12 flex flex-col gap-6" style={{ backgroundColor: '#ededed' }}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Vår metode
              </h2>
              
              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Heimby hjelper deg med å finne den mest lønnsomme løsningen for boligen din.
                </p>
                
                <p className="text-lg text-gray-700 leading-relaxed">
                  Vi tar oss av hele prosessen – du får en trygg og enkel hverdag.
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  Hvorfor velge Heimby?
                </h3>
                <ul className="space-y-2 text-base text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Opp til 30% høyere leieinntekter</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Null timer brukt på gjester og leietakere</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Mer data og oversikt</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={index} className="border-b border-gray-300 pb-3">
                    <button
                      onClick={() => toggleExpand(index)}
                      className="w-full flex items-center justify-between text-left py-2 hover:opacity-70 transition-opacity"
                    >
                      <span className="text-lg md:text-xl font-semibold text-gray-900">
                        {service.title}
                      </span>
                      {expandedIndex === index ? (
                        <Minus className="w-5 h-5 text-gray-700 flex-shrink-0" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-700 flex-shrink-0" />
                      )}
                    </button>
                    {expandedIndex === index && (
                      <div className="mt-3 text-base text-gray-700 leading-relaxed animate-fade-in">
                        {service.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeAreSection;