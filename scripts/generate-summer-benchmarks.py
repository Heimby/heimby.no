#!/usr/bin/env python3
"""Build the public June-August benchmark from live Proptonomy and Guesty data.

The script deliberately returns aggregates only. Guest names, addresses, listing IDs,
property IDs and reservation IDs never enter the generated website JSON.
"""

from __future__ import annotations

import json
import math
import statistics
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "frontend/src/data/rentalBenchmarks.json"


REMOTE_PROGRAM = r'''
import datetime as dt
import json
import math
import statistics
import subprocess
import urllib.parse
import urllib.request
from collections import defaultdict

ORG = "7b6adf42-78a8-47cd-92d0-4aa7bbd8c090"
INTEGRATION = "f0839db0-e2fb-4108-8852-752bb80a92d5"
MONTHS = {6: "Juni", 7: "Juli", 8: "August"}
MIN_PROPERTIES = 5
MIN_STAYS = 20


def sql(query):
    return subprocess.check_output(
        [
            "docker", "exec", "proptonomy-backend-db", "psql", "-X",
            "-U", "dev_readonly", "-d", "proptonomy", "-Atqc", query,
        ],
        text=True,
    ).strip()


def sql_json(query):
    wrapped = "SELECT COALESCE(json_agg(row_to_json(x)),'[]'::json)::text FROM (" + query + ") x"
    return json.loads(sql(wrapped))


def api_get(token, path, params):
    url = "https://open-api.guesty.com" + path + "?" + urllib.parse.urlencode(params)
    request = urllib.request.Request(url, headers={"Authorization": "Bearer " + token})
    with urllib.request.urlopen(request, timeout=240) as response:
        return json.load(response)


def market(city, postal_code):
    city = (city or "").strip().lower()
    postal = (postal_code or "").strip()
    if city == "voss":
        return "Voss"
    if city in {"norheimsund", "odda", "ullensvang"} or postal.startswith("56"):
        return "Hardanger"
    if city in {"oslo", "sentrum", "ris", "grünerløkka"} or (len(postal) == 4 and postal[:2].isdigit() and int(postal[:2]) <= 12):
        return "Oslo"
    if city in {"bergen", "bergenhus", "årstad"} or postal.startswith(("50", "51")):
        return "Bergen"
    return "Annet"


def bedroom_group(value):
    if value <= 0:
        return "studio", "Studio"
    if value >= 4:
        return "4+", "4+ soverom"
    return str(value), f"{value} soverom"


def review_group(count):
    if count < 5:
        return "0-4", "Ny / 0–4 anmeldelser"
    if count < 20:
        return "5-19", "5–19 anmeldelser"
    return "20+", "20+ anmeldelser"


def pct(values, fraction):
    if not values:
        return 0
    ordered = sorted(values)
    position = (len(ordered) - 1) * fraction
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return ordered[lower]
    return ordered[lower] + (ordered[upper] - ordered[lower]) * (position - lower)


def round_to(value, nearest):
    return int(nearest * round(float(value) / nearest)) if value is not None else None


token = sql(f"""SELECT "AccessToken" FROM "ExternalIntegrations" WHERE "Id"='{INTEGRATION}' """)

properties = sql_json(f"""
SELECT eei."ExternalEntityId" AS listing_id,
       p."Id" AS property_id,
       p."Bedrooms" AS bedrooms,
       p."Bathrooms" AS bathrooms,
       p."IsActive" AS property_active,
       a."City" AS city,
       a."PostalCode" AS postal_code
FROM "ExternalEntityIntegration" eei
JOIN "Properties" p ON p."Id" = eei."PropertyId"
LEFT JOIN "PropertyAddress" a ON a."Id" = p."AddressId"
WHERE eei."ExternalIntegrationId" = '{INTEGRATION}'
  AND p."OrganizationId" = '{ORG}'
""")

reviews = sql_json(f"""
SELECT "PropertyId" AS property_id,
       "SubmittedAt" AS submitted_at,
       "Rating" AS rating,
       "RatingScale" AS rating_scale
FROM "GuestReviews"
WHERE "OrganizationId" = '{ORG}'
  AND "PropertyId" IS NOT NULL
  AND "SubmittedAt" < '2026-09-01'
  AND "Channel" IN ('airbnb', 'bookingCom')
""")

leases = sql_json(f"""
SELECT l."Id" AS lease_id,
       l."PropertyId" AS property_id,
       l."StartDate" AS start_date,
       l."EndDate" AS end_date,
       eei."Metadata"->>'Platform' AS platform,
       l."GrossRentalIncome" AS accommodation,
       l."CleaningFeeEstimate" AS guest_cleaning,
       l."TotalTaxes" AS taxes
FROM "Leases" l
JOIN "ExternalEntityIntegration" eei ON eei."Id" = l."ExternalEntityIntegrationId"
WHERE l."OrganizationId" = '{ORG}'
  AND l."Type" = 'ShortTerm'
  AND l."Status" IN (0, 1, 2, 5)
  AND l."StartDate" < '2026-09-01'
  AND COALESCE(l."EndDate", l."StartDate" + 1) > '2026-06-01'
  AND eei."Metadata"->>'Platform' IN ('airbnb2', 'bookingCom')
""")

listing_rows = []
for skip in range(0, 500, 100):
    page = api_get(token, "/v1/listings", {
        "limit": 100,
        "skip": skip,
        "fields": "_id active isListed integrations",
    })
    rows = page.get("results", [])
    listing_rows.extend(rows)
    if len(rows) < 100:
        break


def live_ota(integration):
    platform = str(integration.get("platform") or "")
    nested = integration.get(platform) if isinstance(integration.get(platform), dict) else {}
    return (
        platform in {"airbnb2", "bookingCom"}
        and bool(integration.get("externalUrl"))
        and str(nested.get("status") or "").upper() == "COMPLETED"
    )


listing_meta = {
    row.get("_id"): {
        "active": row.get("active") is True,
        "listed": row.get("isListed") is True,
        "live_ota": any(live_ota(item) for item in row.get("integrations", [])),
    }
    for row in listing_rows
}

property_by_listing = {row["listing_id"]: row for row in properties}
eligible_listings = [
    listing_id
    for listing_id, row in property_by_listing.items()
    if row["property_active"]
    and listing_meta.get(listing_id, {}).get("active")
    and listing_meta.get(listing_id, {}).get("listed")
    and listing_meta.get(listing_id, {}).get("live_ota")
]

calendar_days = []
for index in range(0, len(eligible_listings), 20):
    page = api_get(token, "/v1/availability-pricing/api/calendar/listings", {
        "listingIds": ",".join(eligible_listings[index:index + 20]),
        "startDate": "2026-06-01",
        "endDate": "2026-08-31",
        "includeAllotment": "true",
        "ignoreInactiveChildAllotment": "true",
        "ignoreUnlistedChildAllotment": "true",
    })
    calendar_days.extend((page.get("data") or {}).get("days", []))

property_month = defaultdict(lambda: {
    "available": 0,
    "booked": 0,
    "saleable": 0,
    "accommodation": 0.0,
    "gross": 0.0,
    "revenue_nights": 0,
    "stays": set(),
})

for day in calendar_days:
    date = str(day.get("date") or "")[:10]
    if len(date) != 10:
        continue
    month = int(date[5:7])
    if month not in MONTHS:
        continue
    listing_id = day.get("listingId")
    prop = property_by_listing.get(listing_id)
    if not prop:
        continue
    row = property_month[(prop["property_id"], month)]
    status = str(day.get("status") or "").lower()
    if status == "available":
        row["available"] += 1
        row["saleable"] += 1
        continue
    if status not in {"booked", "reserved"}:
        continue
    reservation = day.get("reservation") or {}
    integration = reservation.get("integration") or {}
    platform = str(integration.get("platform") or reservation.get("source") or "").lower()
    if platform not in {"airbnb2", "bookingcom", "booking.com"}:
        continue
    row["booked"] += 1
    row["saleable"] += 1

for lease in leases:
    if not lease.get("property_id") or not lease.get("end_date"):
        continue
    start = dt.date.fromisoformat(lease["start_date"])
    end = dt.date.fromisoformat(lease["end_date"])
    total_nights = max(1, (end - start).days)
    for month, label in MONTHS.items():
        month_start = dt.date(2026, month, 1)
        month_end = dt.date(2026, month + 1, 1) if month < 12 else dt.date(2027, 1, 1)
        overlap = max(0, (min(end, month_end) - max(start, month_start)).days)
        if overlap == 0:
            continue
        row = property_month[(lease["property_id"], month)]
        share = overlap / total_nights
        accommodation = float(lease.get("accommodation") or 0) * share
        guest_cleaning = float(lease.get("guest_cleaning") or 0) * share
        taxes = float(lease.get("taxes") or 0) * share
        row["accommodation"] += accommodation
        row["gross"] += accommodation + guest_cleaning + taxes
        row["revenue_nights"] += overlap
        row["stays"].add(lease["lease_id"])

props_by_id = {row["property_id"]: row for row in properties}

reviews_by_property = defaultdict(list)
for review in reviews:
    submitted = str(review.get("submitted_at") or "")
    if not submitted:
        continue
    rating = review.get("rating")
    scale = review.get("rating_scale")
    normalized = float(rating) * 10 / float(scale) if rating is not None and scale else None
    reviews_by_property[review["property_id"]].append((submitted[:10], normalized))


def review_snapshot(property_id, month):
    cutoff = f"2026-{month:02d}-01"
    rows = [rating for submitted, rating in reviews_by_property.get(property_id, []) if submitted < cutoff]
    rated = [rating for rating in rows if rating is not None]
    return len(rows), (statistics.mean(rated) if rated else None)


eligible = {}
for (property_id, month), row in property_month.items():
    if row["saleable"] < 7:
        continue
    prop = props_by_id[property_id]
    count, average = review_snapshot(property_id, month)
    eligible[(property_id, month)] = {
        **row,
        "property_id": property_id,
        "month": month,
        "market": market(prop.get("city"), prop.get("postal_code")),
        "bedroom_key": bedroom_group(int(prop.get("bedrooms") or 0))[0],
        "bedroom_label": bedroom_group(int(prop.get("bedrooms") or 0))[1],
        "bathrooms": int(prop.get("bathrooms") or 0),
        "review_count": count,
        "review_average": average,
        "review_key": review_group(count)[0],
        "review_label": review_group(count)[1],
    }


def aggregate(rows, month, key, label):
    properties_count = len(rows)
    stays = sum(len(row["stays"]) for row in rows)
    if properties_count < MIN_PROPERTIES or stays < MIN_STAYS:
        return None
    booked = sum(row["booked"] for row in rows)
    saleable = sum(row["saleable"] for row in rows)
    revenue_nights = sum(row["revenue_nights"] for row in rows)
    gross_values = [row["gross"] for row in rows]
    adr_values = [row["accommodation"] / row["revenue_nights"] for row in rows if row["revenue_nights"]]
    rated = [row["review_average"] for row in rows if row["review_average"] is not None]
    return {
        "key": key,
        "label": label,
        "month": month,
        "monthLabel": MONTHS[month],
        "properties": properties_count,
        "saleableNights": saleable,
        "bookedNights": booked,
        "occupancyPct": round(100 * booked / saleable, 1) if saleable else 0,
        "calendarMonthOccupancyPct": round(100 * booked / (properties_count * (30 if month == 6 else 31)), 1),
        "medianSaleableNights": round(statistics.median(row["saleable"] for row in rows), 1),
        "stays": stays,
        "adr": round_to(sum(row["accommodation"] for row in rows) / revenue_nights, 50) if revenue_nights else 0,
        "adrMedianProperty": round_to(statistics.median(adr_values), 50) if adr_values else 0,
        "grossPerPropertyAvg": round_to(statistics.mean(gross_values), 500),
        "grossPerPropertyMedian": round_to(statistics.median(gross_values), 500),
        "grossPerPropertyP25": round_to(pct(gross_values, 0.25), 500),
        "grossPerPropertyP75": round_to(pct(gross_values, 0.75), 500),
        "reviewsAtMonthStart": sum(row["review_count"] for row in rows),
        "averageRating10": round(statistics.mean(rated), 2) if rated else None,
    }


groups = {"overall": [], "city": [], "bedrooms": [], "reviews": []}
for month in MONTHS:
    month_rows = [row for row in eligible.values() if row["month"] == month]
    overall = aggregate(month_rows, month, "all", "Alle aktive boliger")
    if overall:
        groups["overall"].append(overall)
    for dimension, value_key, label_key in [
        ("city", "market", "market"),
        ("bedrooms", "bedroom_key", "bedroom_label"),
        ("reviews", "review_key", "review_label"),
    ]:
        order = {
            "bedrooms": {"studio": 0, "1": 1, "2": 2, "3": 3, "4+": 4},
            "reviews": {"0-4": 0, "5-19": 1, "20+": 2},
        }.get(dimension, {})
        values = sorted({row[value_key] for row in month_rows}, key=lambda value: (order.get(value, 99), value))
        for value in values:
            if dimension == "city" and value == "Annet":
                continue
            selected = [row for row in month_rows if row[value_key] == value]
            label = selected[0][label_key]
            result = aggregate(selected, month, value, label)
            if result:
                groups[dimension].append(result)

featured = []
for month in MONTHS:
    rows = [
        row for row in eligible.values()
        if row["month"] == month and row["market"] == "Bergen"
        and row["bedroom_key"] == "2" and row["bathrooms"] == 1
    ]
    result = aggregate(rows, month, "bergen-2-1", "Bergen · 2 soverom · 1 bad")
    if result:
        featured.append(result)

for dimension, rows in groups.items():
    for row in rows:
        if row["properties"] < MIN_PROPERTIES or row["stays"] < MIN_STAYS:
            raise RuntimeError(f"Privacy threshold failed for {dimension}/{row['label']}")
        if row["bookedNights"] > row["saleableNights"]:
            raise RuntimeError(f"Booked nights exceed saleable nights for {dimension}/{row['label']}")


def public_row(row):
    """Return only rounded per-home statistics safe to ship to a public browser."""
    return {
        "key": row["key"],
        "label": row["label"],
        "month": row["month"],
        "monthLabel": row["monthLabel"],
        "occupancyPct": row["occupancyPct"],
        "adr": row["adr"],
        "grossPerPropertyAvg": row["grossPerPropertyAvg"],
        "grossPerPropertyMedian": row["grossPerPropertyMedian"],
        "grossPerPropertyP25": row["grossPerPropertyP25"],
        "grossPerPropertyP75": row["grossPerPropertyP75"],
        "averageRating10": row["averageRating10"],
    }

result = {
    "title": "Heimby sommerstatistikk 2026",
    "updated": "2026-08-27",
    "period": {"from": "2026-06-01", "to": "2026-08-31", "label": "juni–august 2026"},
    "privacy": {
        "groupRule": "Små grupper skjules. Eksakte antall boliger, opphold, døgn, porteføljesummer og interne regnskapstall publiseres ikke.",
        "rounding": "Beløp per bolig er avrundet til nærmeste 500 kroner.",
    },
    "method": {
        "basis": "Bare boliger som var aktive og publiserte i Guesty, hadde en live Airbnb- eller Booking.com-kobling og minst sju salgbare kalenderdøgn i måneden er med.",
        "availability": "Ledige døgn pluss Airbnb- og Booking.com-bookede døgn regnes som salgbare. Eierblokker, manuelle reservasjoner, stengte døgn og tid før annonsen åpnet er trukket fra.",
        "adr": "Losjiinntekt delt på Airbnb- og Booking.com-netter med inntektsdata.",
        "occupancy": "Airbnb- og Booking.com-bookede døgn delt på salgbare døgn, vektet på tvers av boligene.",
        "grossIncome": "Losji, gjestebetalt renhold og registrerte gjesteskatter periodisert over oppholdets netter. Interne kostnader, provisjoner og eieroppgjør publiseres ikke.",
        "reviews": "Reviewgruppe og rating er basert på publiserte anmeldelser som forelå ved starten av måneden.",
        "august": "August omfatter bekreftede bookinger og åpne kalenderdøgn per 27. august 2026, også de siste dagene av måneden.",
    },
    "months": [{"value": month, "label": label} for month, label in MONTHS.items()],
    "groups": {
        dimension: [public_row(row) for row in rows]
        for dimension, rows in groups.items()
    },
    "featured": [public_row(row) for row in featured],
}
print(json.dumps(result, ensure_ascii=False))
'''


def main() -> None:
    completed = subprocess.run(
        ["ssh", "-o", "BatchMode=yes", "root@api.proptonomy.ai", "python3 -"],
        input=REMOTE_PROGRAM,
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr.strip() or "Remote benchmark generation failed")
    data = json.loads(completed.stdout)
    required = {"method", "groups", "featured", "privacy"}
    missing = required.difference(data)
    if missing:
        raise RuntimeError(f"Generated benchmark is missing: {sorted(missing)}")
    if len(data["groups"]["overall"]) != 3:
        raise RuntimeError("Expected one overall row for each of June, July and August")
    forbidden_public_fields = {
        "properties", "stays", "checkouts", "saleableNights", "bookedNights",
        "grossTotal", "ownerTotal", "ownerSampleProperties", "reviewsAtMonthStart",
        "ownerPerPropertyAvg", "ownerPerPropertyMedian", "ownerPerPropertyP25",
        "ownerPerPropertyP75", "ownerSampleGrossPerPropertyAvg",
        "ownerSampleGrossPerPropertyMedian", "ownerSampleGrossPerPropertyP25",
        "ownerSampleGrossPerPropertyP75", "cleaningPerCheckout",
    }
    serialized = json.dumps(data, ensure_ascii=False)
    leaked = sorted(field for field in forbidden_public_fields if f'"{field}"' in serialized)
    if leaked:
        raise RuntimeError(f"Public benchmark leaks portfolio fields: {leaked}")
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote anonymized per-property benchmarks to {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
