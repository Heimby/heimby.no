/**
 * Push every sitemap URL to IndexNow after a deploy.
 *
 * Why: Search Console and Bing Webmaster both need an account and DNS
 * verification. IndexNow needs neither — it is an open endpoint that takes a
 * key hosted on the site and notifies Bing, Yandex, Seznam and Naver directly.
 * Bing matters beyond its own traffic because ChatGPT's search grounding runs
 * on Bing's index, so this is the shortest path from deploy to AI visibility.
 *
 * Google does not participate in IndexNow; that still needs Search Console.
 */

const fs = require("node:fs");
const path = require("node:path");

const BUILD_DIR = path.join(__dirname, "..", "build");
const HOST = "heimby.no";
const ENDPOINT = "https://api.indexnow.org/IndexNow";

function findKey() {
  // The key is whatever <key>.txt sits in the published root, so the key file
  // and the submitted key can never drift apart.
  const candidates = fs
    .readdirSync(BUILD_DIR)
    .filter((f) => /^[0-9a-f]{8,128}\.txt$/i.test(f));
  if (candidates.length !== 1) {
    throw new Error(
      `expected exactly one IndexNow key file in build/, found ${candidates.length}`,
    );
  }
  const key = path.basename(candidates[0], ".txt");
  const contents = fs.readFileSync(path.join(BUILD_DIR, candidates[0]), "utf8").trim();
  if (contents !== key) {
    throw new Error("key file contents do not match its filename");
  }
  return key;
}

function sitemapUrls() {
  const xml = fs.readFileSync(path.join(BUILD_DIR, "sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const key = findKey();
  const urlList = sitemapUrls();

  const body = {
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList,
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  // 200 accepted, 202 accepted but key still being validated. Anything else is
  // worth printing, but never worth failing a deploy over — the site is
  // already live by this point.
  const text = await res.text().catch(() => "");
  console.log(`indexnow: submitted ${urlList.length} URLs -> HTTP ${res.status} ${text.slice(0, 200)}`);
  if (res.status !== 200 && res.status !== 202) {
    console.log("indexnow: not accepted; the deploy itself is unaffected");
  }
}

main().catch((err) => {
  console.log(`indexnow: skipped (${err.message})`);
});
