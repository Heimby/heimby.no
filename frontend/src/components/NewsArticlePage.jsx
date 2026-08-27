import { ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, Navigate, useParams } from "react-router-dom";
import mediaData from "../data/mediaArticles.json";
import Footer from "./Footer";
import LeadGenSectionSecondary from "./LeadGenSectionSecondary";
import Navbar from "./Navbar";
import NewsGuideContent from "./NewsGuideContent";

const NewsArticlePage = () => {
  const { slug } = useParams();
  const article = mediaData.articles.find((a) => a.slug === slug);

  useEffect(() => {
    if (article) {
      window.scrollTo(0, 0);
    }
  }, [article]);

  if (!article) {
    return <Navigate to="/nyheter" replace />;
  }

  const pageUrl = `https://heimby.no/nyheter/${article.slug}/`;
  const title = article.metaTitle || `${article.title} — ${article.source} | Heimby`;
  const description = (article.description || article.summary).slice(0, 160);
  const isGuide = article.kind === "guide";
  const imageUrl = `https://heimby.no${article.image}`;

  // Related items, so every article page links onward instead of dead-ending.
  const related = mediaData.articles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={imageUrl} />
        {article.date && (
          <meta property="article:published_time" content={article.date} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <link rel="canonical" href={pageUrl} />
      </Helmet>

      <div className="App">
        <Navbar solid />

        <article className="pt-28 pb-16 px-6" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-3xl mx-auto">
            <Link
              to="/nyheter"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Alle nyheter
            </Link>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 mb-4">
              <span className="font-semibold text-gray-900">
                {article.source}
              </span>
              {article.date && (
                <>
                  <span aria-hidden="true">·</span>
                  <time dateTime={article.date}>{article.date}</time>
                </>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-8">
              {article.title}
            </h1>

            <img
              src={article.image}
              alt={article.imageAlt || article.title}
              className="w-full rounded-xl mb-4"
            />
            <p className="text-sm text-gray-500 mb-10">
              {article.imageCaption || `Foto: ${article.source}`}
            </p>

            {isGuide ? (
              <NewsGuideContent guide={article.guide} />
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Om saken</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  {article.summary}
                </p>

                {article.context && (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      Heimbys kommentar
                    </h2>
                    <div className="space-y-4 mb-10">
                      {article.context.split("\n\n").map((para, index) => (
                        <p
                          key={index}
                          className="text-lg text-gray-700 leading-relaxed"
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  </>
                )}

                {article.facts && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 md:p-8 mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      {article.facts.title}
                    </h2>
                    <ul className="space-y-3">
                      {article.facts.items.map((item, index) => (
                        <li
                          key={index}
                          className="text-base text-gray-700 leading-relaxed pl-5 relative"
                        >
                          <span
                            className="absolute left-0 text-gray-400"
                            aria-hidden="true"
                          >
                            •
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Les hele saken hos {article.source}
                  <ExternalLink className="w-4 h-4" />
                </a>

                <p className="text-sm text-gray-500 mt-4">
                  Denne siden er et kort sammendrag. Hele saken ligger hos{" "}
                  {article.source}.
                </p>
              </>
            )}
          </div>
        </article>

        {isGuide && <LeadGenSectionSecondary />}

        <section className="py-16 px-6" style={{ backgroundColor: "#F9F8F4" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Mer fra Heimby
            </h2>
            <ul className="space-y-4 mb-10">
              {related.map((a) => (
                <li key={a.slug}>
                  <Link
                    to={`/nyheter/${a.slug}`}
                    className="block bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <span className="block text-sm text-gray-600 mb-1">
                      {a.source}
                    </span>
                    <span className="block text-lg font-semibold text-gray-900">
                      {a.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="text-base text-gray-700">
              Vurderer du å leie ut?{" "}
              <Link
                to="/korttidsutleie-i-bergen"
                className="font-semibold text-gray-900 underline"
              >
                Se hva som gjelder for korttidsutleie i Bergen
              </Link>{" "}
              — regler, skatt og hva boligen din kan tjene.
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default NewsArticlePage;
