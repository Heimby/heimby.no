import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import cityData from "../data/cityData.json";
import content from "../data/rulesPage.json";
import FAQSection from "./FAQSection";
import Footer from "./Footer";
import LeadGenSection from "./LeadGenSection";
import Navbar from "./Navbar";

const PAGE_URL = "https://heimby.no/korttidsutleie-regler/";

const RulesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>{content.title}</title>
        <meta name="description" content={content.metaDescription} />
        <meta property="og:title" content={content.title} />
        <meta property="og:description" content={content.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={PAGE_URL} />
        <link rel="canonical" href={PAGE_URL} />
      </Helmet>

      <div className="App">
        <Navbar solid />

        <section className="pt-28 pb-10 px-6" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              {content.h1}
            </h1>
            {content.intro.map((para, index) => (
              <p
                key={index}
                className={
                  index === content.intro.length - 1
                    ? "text-sm text-gray-500 leading-relaxed"
                    : "text-lg text-gray-700 leading-relaxed mb-5"
                }
              >
                {para}
              </p>
            ))}
          </div>
        </section>

        <section className="py-12 px-6" style={{ backgroundColor: "#F9F8F4" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {content.definition.title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {content.definition.body}
            </p>
          </div>
        </section>

        {/* Limits by property type — the answer people arrive for */}
        <section className="py-14 px-6" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Grenser etter boligtype
            </h2>
            <div className="space-y-5">
              {content.cases.map((c, index) => (
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
                  <p className="text-sm text-gray-500">Hjemmel: {c.law}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tax */}
        <section className="py-14 px-6" style={{ backgroundColor: "#F9F8F4" }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {content.tax.title.replace(" i Bergen", "")}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {content.tax.intro}
            </p>

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
                {content.tax.rows.map((row, index) => (
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

            <p className="mt-8 text-base text-gray-700 leading-relaxed bg-white p-6 rounded-lg border border-gray-200">
              {content.tax.note}
            </p>
          </div>
        </section>

        {/* What's changing — the freshness signal that makes this worth recrawling */}
        <section className="py-14 px-6" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {content.changes.title}
            </h2>
            <ul className="space-y-4">
              {content.changes.items.map((item, index) => (
                <li
                  key={index}
                  className="text-base text-gray-700 leading-relaxed border-l-4 border-amber-500 pl-5 py-1"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-14 px-6" style={{ backgroundColor: "#F9F8F4" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Reglene der du bor
            </h2>
            <div className="flex flex-wrap gap-3">
              {Object.keys(cityData).map((slug) => (
                <Link
                  key={slug}
                  to={`/korttidsutleie-i-${slug}`}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-base font-medium text-gray-900 hover:border-gray-400 transition-colors"
                >
                  {cityData[slug].name}
                </Link>
              ))}
            </div>
            <p className="text-base text-gray-700 mt-6">
              Vil du vite hva boligen din kan tjene innenfor disse grensene?{" "}
              <Link to="/data" className="font-semibold text-gray-900 underline">
                Se hvordan regnestykket ser ut
              </Link>
              .
            </p>
          </div>
        </section>

        <div id="lead-gen">
          <LeadGenSection />
        </div>

        <FAQSection faqs={content.faqs} cityName="Norge" />

        <Footer />
      </div>
    </>
  );
};

export default RulesPage;
