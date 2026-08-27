/**
 * Build-time SEO guard for the Airbnb earnings page.
 *
 * The site is a React SPA, so this intentionally reads the generated HTML from
 * disk without executing JavaScript. If the important copy, metadata or rental
 * figures disappear from that response, the production build must fail.
 */

const fs = require("node:fs");
const path = require("node:path");

const BUILD_DIR = path.join(__dirname, "..", "build");
const PAGE_PATH = path.join(
  BUILD_DIR,
  "hvor-mye-kan-man-tjene-pa-airbnb",
  "index.html",
);
const PAGE_URL = "https://heimby.no/hvor-mye-kan-man-tjene-pa-airbnb/";
const DATA_PAGE = require("../src/data/dataPage.json");
const BENCHMARKS = require("../src/data/rentalBenchmarks.json");

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const matches = (text, pattern) => text.match(pattern) || [];
const normalize = (text) => text.replace(/\u00a0/g, " ").replace(/\s+/g, " ");
const roundTo = (value, nearest = 500) => nearest * Math.round(value / nearest);
const money = (value) => `${new Intl.NumberFormat("nb-NO").format(value)} kr`;

if (!fs.existsSync(PAGE_PATH)) {
  console.error(`SEO validation failed: missing ${PAGE_PATH}`);
  process.exit(1);
}

const html = fs.readFileSync(PAGE_PATH, "utf8");
const normalizedHtml = normalize(html);
const sitemap = fs.readFileSync(path.join(BUILD_DIR, "sitemap.xml"), "utf8");
const homepage = fs.readFileSync(path.join(BUILD_DIR, "index.html"), "utf8");
const legacyPage = fs.readFileSync(path.join(BUILD_DIR, "data", "index.html"), "utf8");

check(
  html.includes('<div id="root"><main class="prerendered">'),
  "page body is not present in the initial HTML response",
);
check(!html.includes('<div id="root"></div>'), "page is only an empty SPA shell");
check(matches(html, /<h1(?:\s|>)/g).length === 1, "page must contain exactly one h1");
check(
  html.includes(`<title>${DATA_PAGE.title}</title>`),
  "static title does not match dataPage.json",
);
check(
  html.includes(`<meta name="description" content="${DATA_PAGE.metaDescription}"/>`),
  "static meta description does not match dataPage.json",
);
check(
  DATA_PAGE.metaDescription.length >= 70 && DATA_PAGE.metaDescription.length <= 160,
  "meta description should be between 70 and 160 characters",
);
check(
  matches(html, /<link rel="canonical"/g).length === 1 &&
    html.includes(`<link rel="canonical" href="${PAGE_URL}"/>`),
  "page must have one self-referencing canonical URL",
);
check(
  matches(html, /<meta name="robots"/g).length === 1 &&
    html.includes('<meta name="robots" content="index, follow"/>'),
  "page must have one index, follow robots directive",
);
check(
  html.includes('<meta property="og:type" content="article"/>'),
  "Open Graph type must be article",
);
check(
  html.includes(`<meta property="og:url" content="${PAGE_URL}"/>`),
  "Open Graph URL does not match the canonical URL",
);
check(
  html.includes(`<meta name="twitter:url" content="${PAGE_URL}"/>`),
  "Twitter URL does not match the canonical URL",
);

const schemas = matches(
  html,
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
).map((script) => JSON.parse(script.match(/>([\s\S]*?)<\/script>/)[1]));
const schemaTypes = new Set(schemas.map((schema) => schema["@type"]));
for (const type of ["Article", "BreadcrumbList", "Dataset", "FAQPage"]) {
  check(schemaTypes.has(type), `missing ${type} JSON-LD`);
}
const article = schemas.find((schema) => schema["@type"] === "Article");
check(article?.mainEntityOfPage?.["@id"] === PAGE_URL, "Article mainEntityOfPage is wrong");
check(article?.image, "Article JSON-LD is missing an image");

const top25 = (year) => {
  const row = BENCHMARKS.groups.city.find(
    (candidate) =>
      candidate.key === "Bergen" && candidate.year === year && candidate.month === 8,
  );
  check(Boolean(row), `missing Bergen August ${year} benchmark`);
  if (!row) return [];
  const gross = row.grossPerPropertyP75;
  const platform = roundTo(gross * 0.16);
  const heimby = roundTo(gross * 0.15 * 1.25);
  const cleaning = roundTo(gross * 0.15);
  return [gross, platform, heimby, cleaning, gross - platform - heimby - cleaning];
};

for (const value of [...top25(2026), ...top25(2025)]) {
  check(
    normalizedHtml.includes(normalize(money(value))),
    `${money(value)} is missing from the initial HTML response`,
  );
}

check(
  matches(sitemap, new RegExp(PAGE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))
    .length === 1,
  "canonical URL must appear exactly once in sitemap.xml",
);
check(
  homepage.includes('href="/hvor-mye-kan-man-tjene-pa-airbnb/"'),
  "homepage does not contain a crawlable link to the earnings page",
);
check(
  matches(legacyPage, /<meta name="robots"/g).length === 1 &&
    legacyPage.includes('<meta name="robots" content="noindex, follow"/>'),
  "/data must have exactly one noindex, follow robots directive",
);
check(
  legacyPage.includes(`<link rel="canonical" href="${PAGE_URL}"/>`),
  "/data must canonicalize to the earnings page",
);

if (failures.length) {
  console.error("SEO validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "SEO validation passed: metadata, schema, sitemap, internal link and prerendered benchmark values are present.",
);
