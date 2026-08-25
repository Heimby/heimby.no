import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Navigate, useLocation, useParams } from "react-router-dom";
import cityData from "../data/cityData.json";
import FAQSection from "./FAQSection";
import Footer from "./Footer";
import LeadGenSection from "./LeadGenSection";
import Navbar from "./Navbar";
import ProfessionalServicesSection from "./ProfessionalServicesSection";
import WhatWeAreSection from "./WhatWeAreSection";

const CityPage = () => {
  const { city } = useParams();
  const location = useLocation();

  // Extract city slug from URL if not in params
  const citySlug =
    city || location.pathname.split("/korttidsutleie-i-")[1]?.split("/")[0];
  const data = cityData[citySlug];

  useEffect(() => {
    if (data) {
      document.title = data.title;
      window.scrollTo(0, 0);
    }
  }, [data]);

  // If city doesn't exist, redirect to home
  if (!data) {
    return <Navigate to="/" replace />;
  }

  const pageUrl = `https://heimby.no/korttidsutleie-i-${data.slug}/`;
  return (
    <>
      <Helmet>
        <title>{data.title}</title>
        <meta name="description" content={data.metaDescription} />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <link rel="canonical" href={pageUrl} />
        {/* JSON-LD is emitted into the static HTML by scripts/prerender.js
            (LocalBusiness, Service, BreadcrumbList, FAQPage). Repeating it here
            would leave duplicate blocks in the DOM after hydration. */}
      </Helmet>

      <div className="App">
        <Navbar />

        {/* Hero Section */}
        <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(/img/create-a-mix-of-no-1.jpg)",
            }}
          >
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          <div className="relative z-10 text-center px-6 py-20 max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {data.heroTitle}
            </h1>
            <p className="text-2xl md:text-3xl text-white/95 font-light mb-6">
              {data.heroSubtitle}
            </p>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {data.heroDescription}
            </p>
          </div>
        </section>

        {/* Key Facts — direct answers, positioned high for featured snippets and AI citation */}
        {data.keyFacts && (
          <section
            className="py-16 px-6"
            style={{ backgroundColor: "#F9F8F4" }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {data.keyFacts.title}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {data.keyFacts.intro}
              </p>
              <dl className="space-y-5">
                {data.keyFacts.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-6 border-l-4 border-gray-900 shadow-sm"
                  >
                    <dt className="text-lg font-semibold text-gray-900 mb-2">
                      {item.label}
                    </dt>
                    <dd className="text-base text-gray-700 leading-relaxed">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {data.lastUpdated && (
                <p className="text-sm text-gray-500 mt-8">
                  Sist oppdatert {data.lastUpdated}. Innholdet bygger på
                  eierseksjonsloven § 24, borettslagsloven § 5-4 og
                  Skatteetatens regler for utleie av bolig.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Introduction Section */}
        <section className="py-16 px-6" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
              {data.introSection.title}
            </h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              {data.introSection.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Benefits */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg"
                >
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-base text-gray-800">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rules — the legal question everybody actually searches for */}
        {data.rulesSection && (
          <section
            className="py-16 px-6"
            style={{ backgroundColor: "#F9F8F4" }}
          >
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {data.rulesSection.title}
              </h2>
              <p className="text-lg text-gray-700 mb-10 leading-relaxed">
                {data.rulesSection.intro}
              </p>

              <div className="space-y-6">
                {data.rulesSection.cases.map((c, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-4">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                        {c.type}
                      </h3>
                      <span className="inline-block px-3 py-1 bg-gray-900 text-white text-sm font-medium rounded-full">
                        {c.limit}
                      </span>
                    </div>
                    <p className="text-base text-gray-700 leading-relaxed mb-3">
                      {c.detail}
                    </p>
                    <p className="text-base text-gray-700 leading-relaxed mb-3">
                      <strong>Merk:</strong> {c.note}
                    </p>
                    <p className="text-sm text-gray-500">
                      Hjemmel: {c.law}
                    </p>
                  </div>
                ))}
              </div>

              {data.rulesSection.extra && (
                <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {data.rulesSection.extra.title}
                  </h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {data.rulesSection.extra.text}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tax — the second-most searched question */}
        {data.taxSection && (
          <section
            className="py-16 px-6"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {data.taxSection.title}
              </h2>
              <p className="text-lg text-gray-700 mb-10 leading-relaxed">
                {data.taxSection.intro}
              </p>

              {/* Reflows from a table into stacked rows below md, so narrow
                  screens never need to scroll sideways to read it. */}
              <table className="block md:table w-full text-left border-collapse">
                <thead className="hidden md:table-header-group">
                  <tr className="border-b-2 border-gray-900">
                    <th className="py-4 pr-6 text-base font-bold text-gray-900 align-bottom w-1/4">
                      Situasjon
                    </th>
                    <th className="py-4 pr-6 text-base font-bold text-gray-900 align-bottom w-2/5">
                      Regel
                    </th>
                    <th className="py-4 text-base font-bold text-gray-900 align-bottom">
                      Eksempel
                    </th>
                  </tr>
                </thead>
                <tbody className="block md:table-row-group">
                  {data.taxSection.rows.map((row, index) => (
                    <tr
                      key={index}
                      className="block md:table-row border-b border-gray-200 py-5 md:py-0"
                    >
                      <td className="block md:table-cell md:py-5 md:pr-6 text-base font-semibold text-gray-900 align-top">
                        {row.situation}
                      </td>
                      <td className="block md:table-cell md:py-5 md:pr-6 mt-2 md:mt-0 text-base text-gray-700 align-top">
                        <span className="md:hidden font-semibold text-gray-900">
                          Regel:{" "}
                        </span>
                        {row.rule}
                      </td>
                      <td className="block md:table-cell md:py-5 mt-2 md:mt-0 text-base text-gray-600 align-top">
                        <span className="md:hidden font-semibold text-gray-900">
                          Eksempel:{" "}
                        </span>
                        {row.example}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.taxSection.note && (
                <p className="mt-8 text-base text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-lg">
                  {data.taxSection.note}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Strategy comparison */}
        {data.strategySection && (
          <section
            className="py-16 px-6"
            style={{ backgroundColor: "#F9F8F4" }}
          >
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {data.strategySection.title}
              </h2>
              <p className="text-lg text-gray-700 mb-10 leading-relaxed">
                {data.strategySection.intro}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.strategySection.options.map((opt, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col gap-3"
                  >
                    <h3 className="text-xl font-bold text-gray-900">
                      {opt.name}
                    </h3>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      {opt.profile}
                    </p>
                    <p className="text-base text-gray-700 leading-relaxed">
                      {opt.description}
                    </p>
                    <p className="text-base text-gray-600 mt-auto pt-3 border-t border-gray-200">
                      <strong className="text-gray-900">Passer for:</strong>{" "}
                      {opt.bestFor}
                    </p>
                  </div>
                ))}
              </div>

              {data.strategySection.closing && (
                <p className="mt-10 text-lg text-gray-700 leading-relaxed">
                  {data.strategySection.closing}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Districts — long-tail coverage for neighbourhood searches */}
        {data.districtsSection && (
          <section
            className="py-16 px-6"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {data.districtsSection.title}
              </h2>
              <p className="text-lg text-gray-700 mb-10 leading-relaxed">
                {data.districtsSection.intro}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.districtsSection.districts.map((d, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-gray-900 pl-5 py-2"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {d.name}
                    </h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      {d.profile}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trust / experience signals */}
        {data.trustSection && (
          <section
            className="py-16 px-6"
            style={{ backgroundColor: "#F9F8F4" }}
          >
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
                {data.trustSection.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {data.trustSection.points.map((p, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                  >
                    <div className="text-4xl font-bold text-gray-900 leading-none mb-2">
                      {p.stat}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 mb-3">
                      {p.label}
                    </div>
                    <p className="text-base text-gray-700 leading-relaxed">
                      {p.detail}
                    </p>
                  </div>
                ))}
              </div>

              {data.trustSection.closing && (
                <p className="mt-10 text-lg text-gray-700 leading-relaxed">
                  {data.trustSection.closing}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Lead Generation Section */}
        <div id="lead-gen">
          <LeadGenSection />
        </div>

        {/* How It Works Section */}
        <WhatWeAreSection />

        {/* Professional Services Section */}
        <ProfessionalServicesSection />

        {/* FAQ Section */}
        <FAQSection faqs={data.faqs} cityName={data.name} />

        {/* CTA Section */}
        <section className="py-20 px-6" style={{ backgroundColor: "#1a1a1a" }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Klar til å maksimere inntektene fra boligen din i {data.name}?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Få en gratis vurdering av din eiendom og se hvor mye du kan tjene
            </p>
            <a
              href="#lead-gen"
              className="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Få gratis vurdering
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default CityPage;
