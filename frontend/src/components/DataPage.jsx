import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import cityData from "../data/cityData.json";
import content from "../data/dataPage.json";
import FAQSection from "./FAQSection";
import Footer from "./Footer";
import LeadGenSection from "./LeadGenSection";
import Navbar from "./Navbar";

const PAGE_URL = "https://heimby.no/hvor-mye-kan-man-tjene-pa-airbnb/";

const DataPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    // The prerendered page provides a canonical before JavaScript loads.
    // Remove that unmanaged tag after hydration so client-side navigation from
    // the homepage cannot leave its old canonical alongside this page's URL.
    document
      .querySelectorAll('link[rel="canonical"]:not([data-react-helmet])')
      .forEach((link) => link.remove());
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

        <section className="pt-28 pb-12 px-6" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              {content.h1}
            </h1>
            <aside
              aria-labelledby="kort-svar-tittel"
              className="mb-8 rounded-2xl bg-gray-900 p-7 text-white md:p-9"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                {content.answerBox.label}
              </p>
              <h2
                id="kort-svar-tittel"
                className="mb-4 text-2xl font-bold leading-tight md:text-3xl"
              >
                {content.answerBox.answer}
              </h2>
              <p className="text-base leading-relaxed text-white/85 md:text-lg">
                {content.answerBox.body}
              </p>
            </aside>
            {content.intro.map((para, index) => (
              <p
                key={index}
                className="text-lg text-gray-700 leading-relaxed mb-5"
              >
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* The four things that actually move the number */}
        <section className="py-14 px-6" style={{ backgroundColor: "#F9F8F4" }}>
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Fire ting avgjør tallet
            </h2>
            {content.drivers.map((d, index) => (
              <div key={index} className="bg-white rounded-xl p-6 md:p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {d.title}
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  {d.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Strategy comparison */}
        <section className="py-14 px-6" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {content.strategies.title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {content.strategies.intro}
            </p>

            <table className="block md:table w-full text-left border-collapse">
              <thead className="hidden md:table-header-group">
                <tr className="border-b-2 border-gray-900">
                  <th className="py-3 pr-6 text-sm font-bold uppercase tracking-wide text-gray-600">
                    Strategi
                  </th>
                  <th className="py-3 pr-6 text-sm font-bold uppercase tracking-wide text-gray-600">
                    Inntekt
                  </th>
                  <th className="py-3 pr-6 text-sm font-bold uppercase tracking-wide text-gray-600">
                    Risiko
                  </th>
                  <th className="py-3 text-sm font-bold uppercase tracking-wide text-gray-600">
                    Kommentar
                  </th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {content.strategies.rows.map((r, index) => (
                  <tr
                    key={index}
                    className="block md:table-row border-b border-gray-200 py-5 md:py-0"
                  >
                    <td className="block md:table-cell md:py-5 md:pr-6 text-base font-semibold text-gray-900 align-top">
                      {r.name}
                    </td>
                    <td className="block md:table-cell md:py-5 md:pr-6 mt-2 md:mt-0 text-base text-gray-700 align-top">
                      <span className="md:hidden font-semibold text-gray-900">
                        Inntekt:{" "}
                      </span>
                      {r.income}
                    </td>
                    <td className="block md:table-cell md:py-5 md:pr-6 mt-2 md:mt-0 text-base text-gray-700 align-top">
                      <span className="md:hidden font-semibold text-gray-900">
                        Risiko:{" "}
                      </span>
                      {r.risk}
                    </td>
                    <td className="block md:table-cell md:py-5 mt-2 md:mt-0 text-base text-gray-600 align-top">
                      {r.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Gross to net */}
        <section className="py-14 px-6" style={{ backgroundColor: "#F9F8F4" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {content.netSection.title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {content.netSection.intro}
            </p>
            <ol className="space-y-4 mb-8">
              {content.netSection.steps.map((step, index) => (
                <li
                  key={index}
                  className="flex gap-4 bg-white rounded-lg p-5 border border-gray-200"
                >
                  <span className="font-bold text-gray-400 tabular-nums">
                    {index + 1}
                  </span>
                  <span className="text-base text-gray-700 leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <p className="text-base text-gray-700 leading-relaxed bg-white p-6 rounded-lg border border-gray-200">
              {content.netSection.note}
            </p>
          </div>
        </section>

        {/* City links — this page ranks for a multi-city query, so send the
            reader to the page for their own city. */}
        <section className="py-14 px-6" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Regler og marked, by for by
            </h2>
            <div className="flex flex-wrap gap-3">
              {Object.keys(cityData).map((slug) => (
                <Link
                  key={slug}
                  to={`/korttidsutleie-i-${slug}`}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-base font-medium text-gray-900 hover:border-gray-400 transition-colors"
                >
                  {cityData[slug].name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div id="lead-gen">
          <LeadGenSection />
        </div>

        <FAQSection
          faqs={content.faqs}
          cityName="Norge"
          defaultExpandedIndex={0}
        />

        <Footer />
      </div>
    </>
  );
};

export default DataPage;
