import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import mediaData from "../data/mediaArticles.json";
import Footer from "./Footer";
import Navbar from "./Navbar";

const TITLE = "Heimby i media — presseomtale og podkaster | Heimby";
const DESCRIPTION =
  "Samlet oversikt over presseomtale av Heimby: NRK, TV 2, Bergensavisen, Nettavisen, Shifter, Firdaposten og podkaster om korttidsutleie og utleieforvaltning.";

const NewsIndexPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Newest first; undated items (podcasts) sort last rather than jumping ahead.
  const articles = [...mediaData.articles].sort((a, b) =>
    (b.date || "").localeCompare(a.date || ""),
  );

  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://heimby.no/nyheter/" />
        <link rel="canonical" href="https://heimby.no/nyheter/" />
      </Helmet>

      <div className="App">
        <Navbar solid />

        <section className="pt-28 pb-12 px-6" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
              Heimby i media
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl leading-relaxed">
              Presseomtale, debattinnlegg og podkaster om Heimby, korttidsutleie
              og utleieforvaltning. Hver sak har et kort sammendrag og lenke til
              hele artikkelen hos avisen.
            </p>
          </div>
        </section>

        <section className="pb-20 px-6" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Link
                key={a.slug}
                to={`/nyheter/${a.slug}`}
                className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-400 hover:shadow-md transition-all"
              >
                <img
                  src={a.image}
                  alt={a.title}
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="flex flex-col gap-2 p-5">
                  <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {a.source}
                    </span>
                    {a.date && (
                      <>
                        <span aria-hidden="true">·</span>
                        <time dateTime={a.date}>{a.date}</time>
                      </>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 leading-snug">
                    {a.title}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {a.summary.length > 130
                      ? `${a.summary.slice(0, 130)}…`
                      : a.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default NewsIndexPage;
