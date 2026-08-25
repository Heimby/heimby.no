#!/usr/bin/env python3
"""
Search-engine index scoring for heimby.no and its competitors.

Scores a page the way a crawler experiences it: raw HTML, no JavaScript
execution. That is exactly what GPTBot / ClaudeBot / PerplexityBot get, and
close to what Googlebot gets on its first pass.

Usage:
  scripts/seo-score.py <label>=<url-or-file> [...]
  scripts/seo-score.py --heimby        # score the live site + known rivals

Needs: pip3 install requests beautifulsoup4 lxml
"""

import json
import re
import sys

import requests
from bs4 import BeautifulSoup

UA = "Mozilla/5.0 (compatible; SEO-audit/1.0; +https://heimby.no)"

# Terms that define intent for "korttidsutleie bergen", from the live SERP
# and its "Mer å spørre om" box.
INTENT_TERMS = [
    "korttidsutleie", "bergen", "airbnb", "utleie", "leie ut",
    "90 døgn", "eierseksjon", "borettslag", "skatt", "regler",
    "langtidsutleie", "leiepris", "sameie", "forvaltning", "døgn",
]

# Substrings that signal a page states sources precisely enough to be quoted.
AUTHORITY_MARKERS = [
    "eierseksjonsloven", "borettslagsloven", "skatteloven", "skatteetaten",
    "§", "lovdata", "huseierne",
]

DEFAULT_TARGETS = [
    ("heimby.no/", "https://heimby.no/"),
    ("heimby.no/bergen", "https://heimby.no/korttidsutleie-i-bergen/"),
    ("heimby.no/oslo", "https://heimby.no/korttidsutleie-i-oslo/"),
    ("heimby.no/nyheter", "https://heimby.no/nyheter/"),
    ("digihome.no/bergen", "https://digihome.no/utleie/bergen"),
    ("digihome.no/regler", "https://digihome.no/guider/korttidsutleie-regler"),
    ("enkelbnb.no", "https://www.enkelbnb.no/"),
    ("bergenbeds.no", "https://www.bergenbeds.no"),
    ("bnbservice.no", "https://www.bnbservice.no"),
]


def fetch(target):
    """Return (status, html). Accepts a URL or a local file path."""
    if target.startswith("http"):
        try:
            r = requests.get(target, headers={"User-Agent": UA}, timeout=25)
            return r.status_code, r.text
        except Exception as exc:  # network flakiness shouldn't kill the run
            return 0, f"<!-- fetch failed: {exc} -->"
    with open(target, encoding="utf-8") as fh:
        return 200, fh.read()


def visible_text(soup):
    """Text a crawler reads, with script/style/noscript stripped out."""
    clone = BeautifulSoup(str(soup), "lxml")
    for tag in clone(["script", "style", "noscript", "template"]):
        tag.decompose()
    return re.sub(r"\s+", " ", clone.get_text(" ")).strip()


def jsonld_types(soup):
    types = []
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        raw = tag.string or tag.get_text()
        if not raw or not raw.strip():
            continue
        try:
            data = json.loads(raw)
        except Exception:
            types.append("INVALID")
            continue
        for node in data if isinstance(data, list) else [data]:
            if isinstance(node, dict):
                t = node.get("@type")
                types.extend(t if isinstance(t, list) else [t])
                for sub in node.get("@graph", []) or []:
                    if isinstance(sub, dict) and sub.get("@type"):
                        types.append(sub["@type"])
    return [t for t in types if t]


def scale(value, floor, ceiling, points):
    """Linear score between a floor (0 pts) and ceiling (full points)."""
    if value <= floor:
        return 0.0
    if value >= ceiling:
        return float(points)
    return round(points * (value - floor) / (ceiling - floor), 1)


def score(label, target):
    status, html = fetch(target)
    soup = BeautifulSoup(html, "lxml")
    text = visible_text(soup)
    low = text.lower()
    words = len(text.split())

    h1s = [h.get_text(strip=True) for h in soup.find_all("h1")]
    h2s = soup.find_all("h2")
    headings = soup.find_all(["h1", "h2", "h3"])
    title = soup.title.get_text(strip=True) if soup.title else ""
    desc_tag = soup.find("meta", attrs={"name": "description"})
    desc = desc_tag.get("content", "") if desc_tag else ""
    canonical = soup.find("link", attrs={"rel": "canonical"})
    ld = jsonld_types(soup)

    checks = {}

    # --- Crawlability: the gate. No content here means nothing else counts. ---
    checks["Reachable (HTTP 200)"] = (10.0 if status == 200 else 0.0, 10)
    checks["Readable without JS"] = (scale(words, 100, 800, 12), 12)
    checks["H1 in raw HTML"] = (5.0 if h1s else 0.0, 5)
    checks["Headings in raw HTML"] = (scale(len(headings), 1, 12, 5), 5)

    # --- On-page SEO ---
    checks["Title length 30-65"] = (
        5.0 if 30 <= len(title) <= 65 else (2.5 if title else 0.0), 5)
    checks["Title has keyword"] = (
        5.0 if re.search(r"korttidsutleie|korttidsleie", title, re.I) else 0.0, 5)
    checks["Meta description 70-165"] = (
        5.0 if 70 <= len(desc) <= 165 else (2.0 if desc else 0.0), 5)
    checks["Exactly one H1"] = (4.0 if len(h1s) == 1 else 0.0, 4)
    checks["Has H2 structure"] = (scale(len(h2s), 0, 6, 4), 4)
    checks["Canonical URL"] = (4.0 if canonical else 0.0, 4)

    # --- Content depth ---
    checks["Word count"] = (scale(words, 200, 2000, 12), 12)
    checks["Heading depth"] = (scale(len(headings), 3, 30, 6), 6)
    checks["Table or list markup"] = (
        4.0 if soup.find(["table", "dl"]) or len(soup.find_all("li")) > 8 else 0.0, 4)

    # --- Structured data ---
    checks["Valid JSON-LD"] = (5.0 if ld and "INVALID" not in ld else 0.0, 5)
    checks["FAQPage schema"] = (4.0 if "FAQPage" in ld else 0.0, 4)
    checks["Business schema"] = (
        3.0 if {"LocalBusiness", "Organization"} & set(ld) else 0.0, 3)
    checks["Breadcrumb schema"] = (3.0 if "BreadcrumbList" in ld else 0.0, 3)

    # --- GEO: what makes an LLM quote you rather than summarise around you ---
    hits = [t for t in INTENT_TERMS if t in low]
    checks["Intent term coverage"] = (scale(len(hits), 2, 13, 6), 6)
    auth = [m for m in AUTHORITY_MARKERS if m in low]
    checks["Cites law/sources"] = (scale(len(auth), 0, 4, 6), 6)
    checks["Specific figures"] = (
        scale(len(re.findall(r"\b\d[\d\s]{2,}\b|\b\d+\s?%", text)), 2, 20, 4), 4)
    checks["Freshness signal"] = (
        3.0 if re.search(r"20(2[4-9]|3\d)", text) else 0.0, 3)

    earned = sum(v[0] for v in checks.values())
    total = sum(v[1] for v in checks.values())
    return {
        "label": label, "status": status, "words": words,
        "headings": len(headings), "title": title, "ld": sorted(set(ld)),
        "checks": checks, "earned": round(earned, 1), "total": total,
        "pct": round(100 * earned / total, 1),
    }


GROUPS = [
    ("CRAWLABILITY", ["Reachable (HTTP 200)", "Readable without JS",
                      "H1 in raw HTML", "Headings in raw HTML"]),
    ("ON-PAGE SEO", ["Title length 30-65", "Title has keyword",
                     "Meta description 70-165", "Exactly one H1",
                     "Has H2 structure", "Canonical URL"]),
    ("CONTENT DEPTH", ["Word count", "Heading depth", "Table or list markup"]),
    ("STRUCTURED DATA", ["Valid JSON-LD", "FAQPage schema", "Business schema",
                         "Breadcrumb schema"]),
    ("AI CITABILITY", ["Intent term coverage", "Cites law/sources",
                       "Specific figures", "Freshness signal"]),
]


def main():
    args = sys.argv[1:]
    if not args or args[0] == "--heimby":
        targets = DEFAULT_TARGETS
        detail = False
    else:
        targets = [a.split("=", 1) for a in args]
        detail = True

    results = [score(lbl, tgt) for lbl, tgt in targets]

    if detail:
        for r in results:
            print(f"\n{'=' * 74}")
            print(f"{r['label']}   —   {r['pct']}/100   ({r['earned']}/{r['total']} pts)")
            print(f"{'=' * 74}")
            print(f"  HTTP {r['status']}  ·  {r['words']} words  ·  {r['headings']} headings")
            print(f"  title: {r['title'][:70] or '(none)'}")
            print(f"  schema: {', '.join(r['ld']) or '(none)'}")
            for gname, keys in GROUPS:
                ge = sum(r["checks"][k][0] for k in keys)
                gt = sum(r["checks"][k][1] for k in keys)
                print(f"\n  {gname}  {ge:.0f}/{gt}")
                for k in keys:
                    got, mx = r["checks"][k]
                    filled = int(round(10 * got / mx))
                    bar = "#" * filled + "." * (10 - filled)
                    print(f"    {bar}  {got:>4.1f}/{mx:<3} {k}")

    print(f"\n{'=' * 74}")
    print("LEADERBOARD".center(74))
    print(f"{'=' * 74}")
    print(f"  {'Page':<28}{'Score':>8}{'Words':>9}{'Schema':>9}{'Crawl':>9}")
    print(f"  {'-' * 62}")
    for r in sorted(results, key=lambda x: -x["pct"]):
        crawl = sum(r["checks"][k][0] for k in GROUPS[0][1])
        sd = sum(r["checks"][k][0] for k in GROUPS[3][1])
        print(f"  {r['label'][:27]:<28}{r['pct']:>7}%{r['words']:>9}{sd:>7.0f}/15{crawl:>7.0f}/32")


if __name__ == "__main__":
    main()
