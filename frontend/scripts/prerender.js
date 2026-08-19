/**
 * Post-build prerenderer.
 *
 * Why this exists: the site is a client-rendered React SPA served from GitHub
 * Pages. Googlebot can execute JS, but AI crawlers (GPTBot, ClaudeBot,
 * PerplexityBot, OAI-SearchBot) cannot — to them an empty <div id="root"> is an
 * empty page. GitHub Pages also has no SPA fallback, so every deep route used to
 * return a hard 404.
 *
 * This script writes a real static HTML file per route into build/<route>/index.html,
 * with the page's actual copy, headings and JSON-LD already in the markup.
 * React still boots from the same bundle and takes over on mount, so users get
 * the full app while crawlers get readable HTML.
 */

const fs = require("node:fs");
const path = require("node:path");

const BUILD_DIR = path.join(__dirname, "..", "build");
const CITY_DATA = require("../src/data/cityData.json");
const HOME_CONTENT = require("../src/data/homeContent.json");
const MEDIA = require("../src/data/mediaArticles.json");

const SITE = "https://heimby.no";
const OG_IMAGE = `${SITE}/og-image.jpg`;

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// JSON-LD lives inside <script>, so only </script> and HTML-comment openers matter.
const jsonLd = (obj) =>
  JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

/* ------------------------------------------------------------------ *
 * Static markup for a city page — mirrors CityPage.jsx section by section
 * ------------------------------------------------------------------ */

function cityBody(data) {
  const out = [];
  const p = (s) => out.push(s);

  p(`<main class="prerendered">`);
  p(`<h1>${esc(data.heroTitle)}</h1>`);
  p(`<p>${esc(data.heroSubtitle)}</p>`);
  p(`<p>${esc(data.heroDescription)}</p>`);

  if (data.keyFacts) {
    p(`<h2>${esc(data.keyFacts.title)}</h2>`);
    p(`<p>${esc(data.keyFacts.intro)}</p>`);
    p(`<dl>`);
    for (const item of data.keyFacts.items) {
      p(`<dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd>`);
    }
    p(`</dl>`);
  }

  p(`<h2>${esc(data.introSection.title)}</h2>`);
  for (const para of data.introSection.paragraphs) {
    p(`<p>${esc(para)}</p>`);
  }

  if (data.benefits) {
    p(`<ul>`);
    for (const b of data.benefits) p(`<li>${esc(b)}</li>`);
    p(`</ul>`);
  }

  if (data.rulesSection) {
    p(`<h2>${esc(data.rulesSection.title)}</h2>`);
    p(`<p>${esc(data.rulesSection.intro)}</p>`);
    for (const c of data.rulesSection.cases) {
      p(`<h3>${esc(c.type)} — ${esc(c.limit)}</h3>`);
      p(`<p>${esc(c.detail)}</p>`);
      p(`<p><strong>Merk:</strong> ${esc(c.note)}</p>`);
      p(`<p>Hjemmel: ${esc(c.law)}</p>`);
    }
    if (data.rulesSection.extra) {
      p(`<h3>${esc(data.rulesSection.extra.title)}</h3>`);
      p(`<p>${esc(data.rulesSection.extra.text)}</p>`);
    }
  }

  if (data.taxSection) {
    p(`<h2>${esc(data.taxSection.title)}</h2>`);
    p(`<p>${esc(data.taxSection.intro)}</p>`);
    p(
      `<table><thead><tr><th>Situasjon</th><th>Regel</th><th>Eksempel</th></tr></thead><tbody>`,
    );
    for (const row of data.taxSection.rows) {
      p(
        `<tr><td>${esc(row.situation)}</td><td>${esc(row.rule)}</td><td>${esc(row.example)}</td></tr>`,
      );
    }
    p(`</tbody></table>`);
    if (data.taxSection.note) p(`<p>${esc(data.taxSection.note)}</p>`);
  }

  if (data.strategySection) {
    p(`<h2>${esc(data.strategySection.title)}</h2>`);
    p(`<p>${esc(data.strategySection.intro)}</p>`);
    for (const opt of data.strategySection.options) {
      p(`<h3>${esc(opt.name)}</h3>`);
      p(`<p>${esc(opt.profile)}</p>`);
      p(`<p>${esc(opt.description)}</p>`);
      p(`<p>Passer for: ${esc(opt.bestFor)}</p>`);
    }
    if (data.strategySection.closing) {
      p(`<p>${esc(data.strategySection.closing)}</p>`);
    }
  }

  if (data.districtsSection) {
    p(`<h2>${esc(data.districtsSection.title)}</h2>`);
    p(`<p>${esc(data.districtsSection.intro)}</p>`);
    for (const d of data.districtsSection.districts) {
      p(`<h3>${esc(d.name)}</h3><p>${esc(d.profile)}</p>`);
    }
  }

  if (data.trustSection) {
    p(`<h2>${esc(data.trustSection.title)}</h2>`);
    for (const pt of data.trustSection.points) {
      p(`<h3>${esc(pt.stat)} ${esc(pt.label)}</h3><p>${esc(pt.detail)}</p>`);
    }
    if (data.trustSection.closing) p(`<p>${esc(data.trustSection.closing)}</p>`);
  }

  p(`<h2>Ofte stilte spørsmål om korttidsutleie i ${esc(data.name)}</h2>`);
  for (const faq of data.faqs) {
    p(`<h3>${esc(faq.question)}</h3><p>${esc(faq.answer)}</p>`);
  }

  // Internal links to the other city pages — spreads authority and gives
  // crawlers a path to every landing page from any one of them.
  p(`<h2>Korttidsutleie i andre byer</h2><ul>`);
  for (const slug of Object.keys(CITY_DATA)) {
    if (slug === data.slug) continue;
    p(
      `<li><a href="/korttidsutleie-i-${slug}/">Korttidsutleie i ${esc(CITY_DATA[slug].name)}</a></li>`,
    );
  }
  p(`</ul>`);
  p(`<p><a href="/">Heimby — forvaltning av korttidsutleie og langtidsutleie</a></p>`);
  p(`</main>`);

  return out.join("\n");
}

function citySchemas(data) {
  const pageUrl = `${SITE}/korttidsutleie-i-${data.slug}/`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${pageUrl}#business`,
      name: `Heimby - Korttidsutleie i ${data.name}`,
      description: data.metaDescription,
      url: pageUrl,
      image: OG_IMAGE,
      address: {
        "@type": "PostalAddress",
        addressLocality: data.name,
        addressCountry: "NO",
      },
      areaServed: { "@type": "City", name: data.name },
      serviceType: "Eiendomsforvaltning og korttidsutleie",
      priceRange: "15% av leieinntekter",
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `Forvaltning av korttidsutleie i ${data.name}`,
      serviceType: "Korttidsutleie og eiendomsforvaltning",
      provider: { "@id": `${pageUrl}#business` },
      areaServed: { "@type": "City", name: data.name },
      offers: {
        "@type": "Offer",
        priceSpecification: {
          "@type": "PriceSpecification",
          price: 15,
          priceCurrency: "NOK",
          valueAddedTaxIncluded: false,
          description: "15 % av leieinntekten + MVA. Ingen oppstartskostnad.",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Heimby", item: `${SITE}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: `Korttidsutleie i ${data.name}`,
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];
}

/* ------------------------------------------------------------------ *
 * HTML assembly
 * ------------------------------------------------------------------ */

/**
 * React's createRoot().render() clears #root on mount, so the prerendered
 * markup is visible only for the moment before the bundle boots. This keeps
 * that moment looking like a plain readable document instead of raw markup.
 */
const PRERENDER_STYLE = `<style>
.prerendered{max-width:52rem;margin:0 auto;padding:3rem 1.5rem;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;line-height:1.65}
.prerendered h1{font-size:2.25rem;line-height:1.2;margin:0 0 1rem}
.prerendered h2{font-size:1.6rem;line-height:1.3;margin:2.5rem 0 .75rem}
.prerendered h3{font-size:1.15rem;margin:1.75rem 0 .5rem}
.prerendered p,.prerendered li,.prerendered dd{margin:0 0 .85rem}
.prerendered dt{font-weight:600;margin-top:1rem}
.prerendered dd{margin-left:0}
.prerendered table{width:100%;border-collapse:collapse;margin:1rem 0}
.prerendered th,.prerendered td{text-align:left;padding:.6rem .75rem;border-bottom:1px solid #e5e5e5;vertical-align:top}
.prerendered a{color:#1a1a1a}
</style>`;

function buildPage(template, { url, title, description, body, schemas }) {
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${esc(description)}"/>`,
  );
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${esc(url)}"/>`,
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${esc(url)}"/>`,
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${esc(title)}"/>`,
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${esc(description)}"/>`,
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${esc(title)}"/>`,
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${esc(description)}"/>`,
  );

  // Drop the template's Organization JSON-LD on city pages; page-specific
  // schemas replace it so we never ship two competing descriptions.
  if (schemas) {
    html = html.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      schemas
        .map((s) => `<script type="application/ld+json">${jsonLd(s)}</script>`)
        .join(""),
    );
  }

  html = html.replace("</head>", `${PRERENDER_STYLE}</head>`);
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${body}</div>`,
  );

  return html;
}

/* ------------------------------------------------------------------ *
 * Home page static content
 * ------------------------------------------------------------------ */

const HOME_TITLE = "Airbnb-forvaltning og korttidsutleie i Norge | Heimby";
const HOME_DESCRIPTION =
  "Heimby forvalter korttidsutleie, langtidsutleie og hybride 10-2-løsninger. Rundt 160 leiligheter under forvaltning. 15 % av leieinntekten.";

function homeBody() {
  const cityLinks = Object.keys(CITY_DATA)
    .map(
      (slug) =>
        `<li><a href="/korttidsutleie-i-${slug}/">Korttidsutleie i ${esc(CITY_DATA[slug].name)}</a></li>`,
    )
    .join("\n");

  return `<main class="prerendered">
<h1>Airbnb-forvaltning og utleie av bolig i Norge</h1>
<p>Heimby forvalter korttidsutleie, langtidsutleie og hybride utleiestrategier for boligeiere i Norge. Vi håndterer annonsering, prissetting, gjestekommunikasjon, renhold og vedlikehold — du beholder full kontroll og oversikt i eierportalen.</p>

<h2>Tre utleiemodeller</h2>
<h3>Airbnb-utleie og korttidsutleie</h3>
<p>Vi håndterer hele prosessen: annonse med profesjonelle bilder, dynamisk prissetting, gjestekommunikasjon og renhold mellom hvert opphold. Vi annonserer på både Airbnb og Booking.com.</p>
<h3>Langtidsutleie</h3>
<p>Annonsering, visninger, leietakersjekk, kontrakt, innflytting og løpende oppfølging. Faste månedlige inntekter uten at du bruker tid på det.</p>
<h3>Hybrid 10-2-modell</h3>
<p>Ti måneder langtidsutleie gir stabil grunninntekt, og to måneder korttidsutleie i høysesongen tar ut inntektstoppen. Modellen holder deg samtidig innenfor 90-dagersgrensen i eierseksjonsloven § 24.</p>

<h2>Hva koster det?</h2>
<p>15 % av leieinntekten pluss MVA. Ingen oppstartskostnad, ingen abonnementsavgift og ingen bindingstid. Direkte driftskostnader som renhold og forbruksvarer trekkes fra utbetalingen og spesifiseres linje for linje i eierportalen.</p>

<h2>Bakgrunnen vår</h2>
<p>Heimby ble startet i Bergen av Njål Hopen Eliasson og Mathias Haugsbø. Vi forvalter rundt 160 leiligheter for andre boligeiere og har flest aktive Airbnb-annonser i Bergen. To av gründerne skrev masteroppgave ved Norges Handelshøyskole (NHH) om lønnsomhet og risiko i langtidsutleie, korttidsutleie og dynamiske utleiestrategier i det norske boligmarkedet — det faglige grunnlaget for 10-2-modellen.</p>

<h2>Byer vi opererer i</h2>
<ul>
${cityLinks}
</ul>

<h2>Heimby i media</h2>
<p><a href="/nyheter/">Se alle saker om Heimby</a></p>
<ul>
${MEDIA.articles
  .map(
    (a) =>
      `<li><a href="/nyheter/${a.slug}/">${esc(a.source)}: ${esc(a.title)}</a> — ${esc(a.summary)}</li>`,
  )
  .join("\n")}
</ul>

<h2>Ofte stilte spørsmål</h2>
${HOME_CONTENT.faqs.map((f) => `<h3>${esc(f.question)}</h3>\n<p>${esc(f.answer)}</p>`).join("\n")}

<h2>Kontakt</h2>
<p>E-post: <a href="mailto:endre.jenssen@heimby.no">endre.jenssen@heimby.no</a>. Hovedkontor i Bergen.</p>
</main>`;
}

function homeSchemas() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "Heimby",
      url: SITE,
      logo: `${SITE}/android-chrome-512x512.png`,
      image: OG_IMAGE,
      description:
        "Heimby forvalter korttidsutleie, langtidsutleie og hybride 10-2-løsninger for boligeiere i Norge.",
      email: "endre.jenssen@heimby.no",
      founder: [
        { "@type": "Person", name: "Njål Hopen Eliasson" },
        { "@type": "Person", name: "Mathias Haugsbø" },
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bergen",
        addressCountry: "NO",
      },
      areaServed: Object.keys(CITY_DATA).map((slug) => ({
        "@type": "City",
        name: CITY_DATA[slug].name,
      })),
      sameAs: [
        "https://www.facebook.com/heimby",
        "https://www.instagram.com/heimby",
        "https://www.linkedin.com/company/heimby",
      ],
      subjectOf: MEDIA.articles.map((a) => ({
        "@type": "NewsArticle",
        headline: a.title,
        url: a.url,
        publisher: { "@type": "Organization", name: a.source },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      url: SITE,
      name: "Heimby",
      inLanguage: "nb-NO",
      publisher: { "@id": `${SITE}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Forvaltning av korttidsutleie og langtidsutleie",
      serviceType: "Eiendomsforvaltning",
      provider: { "@id": `${SITE}/#organization` },
      areaServed: Object.keys(CITY_DATA).map((slug) => ({
        "@type": "City",
        name: CITY_DATA[slug].name,
      })),
      offers: {
        "@type": "Offer",
        priceSpecification: {
          "@type": "PriceSpecification",
          price: 15,
          priceCurrency: "NOK",
          valueAddedTaxIncluded: false,
          description: "15 % av leieinntekten + MVA. Ingen oppstartskostnad.",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: HOME_CONTENT.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];
}

/* ------------------------------------------------------------------ *
 * Press coverage: /nyheter and /nyheter/<slug>
 * ------------------------------------------------------------------ */

const newsSorted = () =>
  [...MEDIA.articles].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

function newsIndexBody() {
  const groups = new Map();
  for (const a of newsSorted()) {
    const key = a.date ? a.date.slice(0, 4) : "Podkaster og annet";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(a);
  }

  const sections = [...groups.entries()]
    .map(
      ([year, items]) =>
        `<h2>${esc(year)}</h2>\n<ul>\n` +
        items
          .map(
            (a) =>
              `<li><a href="/nyheter/${a.slug}/">${esc(a.source)}: ${esc(a.title)}</a>` +
              `${a.date ? ` (${a.date})` : ""} — ${esc(a.summary)}</li>`,
          )
          .join("\n") +
        `\n</ul>`,
    )
    .join("\n");

  return `<main class="prerendered">
<h1>Heimby i media</h1>
<p>Presseomtale, debattinnlegg og podkaster om Heimby, korttidsutleie og utleieforvaltning. Hver sak har et kort sammendrag og lenke til hele artikkelen hos avisen.</p>
<p>Heimby ble startet i Bergen og forvalter rundt 160 leiligheter for andre boligeiere. Vi tilbyr korttidsutleie, langtidsutleie og en hybrid 10-2-modell, og omtales jevnlig i norske medier i forbindelse med debatten om korttidsutleie og skyggehoteller.</p>
${sections}
<p><a href="/korttidsutleie-i-bergen/">Korttidsutleie i Bergen — regler, skatt og inntekt</a> · <a href="/">Heimby — forvaltning av korttidsutleie og langtidsutleie</a></p>
</main>`;
}

function newsArticleBody(a) {
  const related = MEDIA.articles.filter((x) => x.slug !== a.slug).slice(0, 3);
  return `<main class="prerendered">
<h1>${esc(a.title)}</h1>
<p>${esc(a.source)}${a.date ? ` · ${a.date}` : ""}</p>
<img src="${esc(a.image)}" alt="${esc(a.title)}">
<p>Foto: ${esc(a.source)}</p>

<h2>Om saken</h2>
<p>${esc(a.summary)}</p>
${a.context ? `<h2>Heimbys kommentar</h2>\n<p>${esc(a.context)}</p>` : ""}
${
  a.facts
    ? `<h2>${esc(a.facts.title)}</h2>\n<ul>\n${a.facts.items.map((i) => `<li>${esc(i)}</li>`).join("\n")}\n</ul>`
    : ""
}

<p><a href="${esc(a.url)}" rel="nofollow noopener">Les hele saken hos ${esc(a.source)}</a></p>
<p>Denne siden er et kort sammendrag. Hele saken ligger hos ${esc(a.source)}.</p>

<h2>Mer omtale av Heimby</h2>
<ul>
${related.map((r) => `<li><a href="/nyheter/${r.slug}/">${esc(r.source)}: ${esc(r.title)}</a></li>`).join("\n")}
</ul>
<p><a href="/nyheter/">Alle nyheter</a> · <a href="/korttidsutleie-i-bergen/">Korttidsutleie i Bergen — regler, skatt og inntekt</a></p>
</main>`;
}

function newsIndexSchemas() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Heimby i media",
      url: `${SITE}/nyheter/`,
      description:
        "Presseomtale, debattinnlegg og podkaster om Heimby, korttidsutleie og utleieforvaltning.",
      isPartOf: { "@id": `${SITE}/#organization` },
      hasPart: newsSorted().map((a) => ({
        "@type": "WebPage",
        name: a.title,
        url: `${SITE}/nyheter/${a.slug}/`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Heimby", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Nyheter", item: `${SITE}/nyheter/` },
      ],
    },
  ];
}

function newsArticleSchemas(a) {
  const pageUrl = `${SITE}/nyheter/${a.slug}/`;
  return [
    {
      "@context": "https://schema.org",
      // The page is our summary of someone else's reporting, not the reporting
      // itself — so it describes the original rather than claiming to be it.
      "@type": "WebPage",
      name: a.title,
      url: pageUrl,
      description: a.summary,
      inLanguage: "nb-NO",
      isPartOf: { "@id": `${SITE}/#organization` },
      primaryImageOfPage: { "@type": "ImageObject", url: `${SITE}${a.image}` },
      about: {
        "@type": "NewsArticle",
        headline: a.title,
        url: a.url,
        ...(a.date ? { datePublished: a.date } : {}),
        publisher: { "@type": "Organization", name: a.source },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Heimby", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Nyheter", item: `${SITE}/nyheter/` },
        { "@type": "ListItem", position: 3, name: a.title, item: pageUrl },
      ],
    },
  ];
}

/* ------------------------------------------------------------------ *
 * Run
 * ------------------------------------------------------------------ */


function main() {
  const indexPath = path.join(BUILD_DIR, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error("prerender: build/index.html not found — run the build first");
    process.exit(1);
  }
  const template = fs.readFileSync(indexPath, "utf8");
  const written = [];

  // Home page, rewritten in place.
  fs.writeFileSync(
    indexPath,
    buildPage(template, {
      url: `${SITE}/`,
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      body: homeBody(),
      schemas: homeSchemas(),
    }),
  );
  written.push("/");

  // One directory per city route, so GitHub Pages serves it as a real URL.
  for (const slug of Object.keys(CITY_DATA)) {
    const data = CITY_DATA[slug];
    const route = `korttidsutleie-i-${slug}`;
    const dir = path.join(BUILD_DIR, route);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "index.html"),
      buildPage(template, {
        url: `${SITE}/${route}/`,
        title: data.title,
        description: data.metaDescription,
        body: cityBody(data),
        schemas: citySchemas(data),
      }),
    );
    written.push(`/${route}`);
  }

  // Press coverage index and one page per article.
  const newsDir = path.join(BUILD_DIR, "nyheter");
  fs.mkdirSync(newsDir, { recursive: true });
  fs.writeFileSync(
    path.join(newsDir, "index.html"),
    buildPage(template, {
      url: `${SITE}/nyheter/`,
      title: "Heimby i media — presseomtale og podkaster | Heimby",
      description:
        "Samlet oversikt over presseomtale av Heimby: NRK, TV 2, Bergensavisen, Nettavisen, Shifter, Firdaposten og podkaster om korttidsutleie.",
      body: newsIndexBody(),
      schemas: newsIndexSchemas(),
    }),
  );
  written.push("/nyheter");

  for (const a of MEDIA.articles) {
    const dir = path.join(newsDir, a.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "index.html"),
      buildPage(template, {
        url: `${SITE}/nyheter/${a.slug}/`,
        title: `${a.title} — ${a.source} | Heimby`,
        description: a.summary.slice(0, 160),
        body: newsArticleBody(a),
        schemas: newsArticleSchemas(a),
      }),
    );
    written.push(`/nyheter/${a.slug}`);
  }

  // Routes that exist in the app but carry no SEO value — served as the plain
  // shell so they resolve instead of 404ing.
  for (const route of ["investors", "login", "owner-portal"]) {
    const dir = path.join(BUILD_DIR, route);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), template);
    written.push(`/${route}`);
  }

  // Anything else falls back to the SPA shell rather than a GitHub 404.
  fs.writeFileSync(path.join(BUILD_DIR, "404.html"), template);

  // Sitemap, generated from the same source of truth as the routes above.
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE}/`, priority: "1.0", changefreq: "weekly" },
    ...Object.keys(CITY_DATA).map((slug) => ({
      loc: `${SITE}/korttidsutleie-i-${slug}/`,
      priority: "0.9",
      changefreq: "monthly",
      lastmod: CITY_DATA[slug].lastUpdated,
    })),
    { loc: `${SITE}/nyheter/`, priority: "0.7", changefreq: "monthly" },
    ...MEDIA.articles.map((a) => ({
      loc: `${SITE}/nyheter/${a.slug}/`,
      priority: "0.5",
      changefreq: "yearly",
      lastmod: a.date,
    })),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod || today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
  )
  .join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(BUILD_DIR, "sitemap.xml"), sitemap);

  console.log(`prerender: wrote ${written.length} pages + sitemap.xml + 404.html`);
  for (const w of written) console.log(`  ${w}`);
}

main();
