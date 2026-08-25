import React from 'react';

const ResultsSection = () => {
  const results = [
    {
      stat: '30%',
      label: 'høyere leieinntekt',
      description: '10-2-modellen kombinerer studentkontrakt og sommerutleie',
    },
    {
      stat: '0',
      label: 'timer brukt på leietakere',
      description: 'Vi håndterer all kontakt med gjester og leietakere',
    },
    {
      stat: 'Full',
      label: 'oversikt over kostnader',
      description: 'Transparent rapportering i din Eierskapsportal',
    },
  ];

  return (
    <section className="relative py-0 px-0 sm:px-6" style={{ backgroundColor: '#F9F8F4' }}>
      <div className="relative min-h-[600px] mx-auto" style={{ maxWidth: '100%' }}>
        <img
          src="/img/image-of-a-norwegi.jpg"
          alt="Property Results"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative max-w-6xl mx-auto py-16 px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div></div>
            
            <div className="rounded-2xl shadow-2xl p-8 md:p-12 flex flex-col gap-8" style={{ backgroundColor: '#ededed' }}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Resultater fra ekte boliger
              </h2>

              <div className="space-y-8">
                {results.map((result, index) => (
                  <div key={index} className="border-l-4 border-gray-900 pl-5 py-1">
                    <div className="space-y-1">
                      <div className="text-4xl md:text-5xl font-bold text-gray-900 leading-none">
                        {result.stat}
                      </div>
                      <div className="text-xl md:text-2xl font-semibold text-gray-900">
                        {result.label}
                      </div>
                      <p className="text-sm md:text-base text-gray-600 pt-1">
                        {result.description}
                      </p>
                    </div>
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

export default ResultsSection;