import { Minus, Plus } from "lucide-react";
import { useState } from "react";

const FAQSection = ({ faqs, cityName, defaultExpandedIndex = null }) => {
  const [expandedIndex, setExpandedIndex] = useState(defaultExpandedIndex);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // No FAQPage JSON-LD here on purpose: scripts/prerender.js already emits it
  // into the static HTML of every page that renders this section, so adding it
  // again on mount would leave two identical FAQPage blocks in the DOM.

  return (
    <>
      <section className="py-16 px-6" style={{ backgroundColor: "#F9F8F4" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Ofte stilte spørsmål
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12">
            Få svar på de vanligste spørsmålene om korttidsutleie i {cityName}
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(index)}
                  aria-expanded={expandedIndex === index}
                  aria-controls={`faq-answer-${index}`}
                  className="w-full flex items-start justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-8">
                    {faq.question}
                  </span>
                  {expandedIndex === index ? (
                    <Minus className="w-6 h-6 text-gray-700 flex-shrink-0 mt-1" />
                  ) : (
                    <Plus className="w-6 h-6 text-gray-700 flex-shrink-0 mt-1" />
                  )}
                </button>
                <div
                  id={`faq-answer-${index}`}
                  hidden={expandedIndex !== index}
                  className="px-6 pb-6 text-base text-gray-700 leading-relaxed animate-fade-in"
                >
                    {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQSection;
