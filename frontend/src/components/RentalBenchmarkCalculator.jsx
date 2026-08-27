import {
  Banknote,
  BedDouble,
  Building2,
  CalendarCheck,
  CalendarDays,
  Gauge,
  MapPin,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";
import benchmarks from "../data/rentalBenchmarks.json";

const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const integer = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 });
const money = (value) => (value == null ? "Ikke publisert" : nok.format(value));

const dimensions = [
  { key: "city", label: "By og marked", icon: MapPin },
  { key: "bedrooms", label: "Antall soverom", icon: BedDouble },
  { key: "reviews", label: "Anmeldelser", icon: Star },
];

const SummaryCard = ({ icon: Icon, label, value, note, dark = false }) => (
  <div
    className={`rounded-2xl border p-5 md:p-6 ${
      dark
        ? "border-gray-900 bg-gray-900 text-white"
        : "border-gray-200 bg-white text-gray-900"
    }`}
  >
    <div className="mb-5 flex items-center gap-2">
      <Icon className={`h-5 w-5 ${dark ? "text-white/65" : "text-gray-500"}`} aria-hidden="true" />
      <span className={`text-sm font-semibold ${dark ? "text-white/65" : "text-gray-600"}`}>
        {label}
      </span>
    </div>
    <p className="text-3xl font-bold tracking-tight md:text-4xl">{value}</p>
    <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-white/60" : "text-gray-500"}`}>
      {note}
    </p>
  </div>
);

const RentalBenchmarkCalculator = () => {
  const [month, setMonth] = useState(7);
  const [dimension, setDimension] = useState("city");

  const overall = benchmarks.groups.overall.find((row) => row.month === month);
  const rows = useMemo(
    () => benchmarks.groups[dimension].filter((row) => row.month === month),
    [dimension, month],
  );

  if (!overall) return null;

  const selectedMonth = benchmarks.months.find((item) => item.value === month);

  return (
    <section id="inntektskalkulator" className="bg-[#F9F8F4] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gray-700">
            <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {benchmarks.title}
          </div>
          <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
            Faktisk sommeromsetning – bare for døgn boligen kunne selges
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">
            Vi har kontrollert annonsestatus og kalenderen dag for dag. Boliger som
            startet sent eller bare var åpne i en ferieperiode får derfor ikke resten
            av måneden registrert som tomgang.
          </p>
        </div>

        <div className="my-8 flex flex-wrap gap-2" aria-label="Velg måned">
          {benchmarks.months.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMonth(item.value)}
              aria-pressed={month === item.value}
              className={`min-h-11 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                month === item.value
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-gray-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {month === 8 && (
          <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
            August viser bekreftede bookinger og åpne kalenderdøgn per 27. august,
            inkludert de siste dagene i måneden. Tallet er derfor en oppdatert bookingstatus,
            ikke et endelig månedsoppgjør.
          </p>
        )}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4">
          <p className="font-semibold text-gray-900">
            {overall.properties} aktive boliger · {integer.format(overall.saleableNights)} salgbare døgn · {integer.format(overall.stays)} opphold
          </p>
          <p className="text-sm text-gray-500">{selectedMonth.label} 2026</p>
        </div>

        <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-950">
          Å dele på alle kalenderdager ville gitt {String(overall.calendarMonthOccupancyPct).replace(".", ",")} % belegg.
          Når bare reelt salgbare døgn brukes, er riktig porteføljebelegg {String(overall.occupancyPct).replace(".", ",")} %.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={Banknote}
            label="Brutto totalt"
            value={money(overall.grossTotal)}
            note="Sum losji, gjestebetalt renhold og registrerte gjesteskatter."
            dark
          />
          <SummaryCard
            icon={Building2}
            label="Brutto per aktiv bolig"
            value={money(overall.grossPerPropertyAvg)}
            note={`Median ${money(overall.grossPerPropertyMedian)}. Midtre 50 %: ${money(overall.grossPerPropertyP25)}–${money(overall.grossPerPropertyP75)}.`}
          />
          <SummaryCard
            icon={Gauge}
            label="Belegg av salgbare døgn"
            value={`${String(overall.occupancyPct).replace(".", ",")} %`}
            note={`${integer.format(overall.bookedNights)} bookede av ${integer.format(overall.saleableNights)} åpne eller bookede døgn.`}
          />
          <SummaryCard
            icon={CalendarDays}
            label="ADR"
            value={money(overall.adr)}
            note="Vektet losjiinntekt per Airbnb- og Booking.com-natt."
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
            <p className="text-sm font-semibold text-gray-600">Beregnet til huseier</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className="text-3xl font-bold text-gray-900">{money(overall.ownerPerPropertyAvg)}</p>
              <p className="text-sm text-gray-500">i snitt per bolig</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Sum {money(overall.ownerTotal)} for {overall.ownerSampleProperties} boliger med komplett
              kostnadsoppsett. Guesty-utbetaling minus registrert Heimby-provisjon og turnover-renhold,
              før eierens skatt og ekstra vedlikehold.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
            <p className="text-sm font-semibold text-gray-600">Renhold per utsjekk</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{money(overall.cleaningPerCheckout)}</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Vektet turnover-kostnad fra boliger med registrert renholdsoppsett. Søndag,
              helligdag, ekstraarbeid og skader kan komme i tillegg.
            </p>
          </div>
        </div>

        <div className="mt-14">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Sammenlign gruppene</p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
                Statistikk per by, størrelse og reviewhistorikk
              </h3>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Velg gruppering">
              {dimensions.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDimension(key)}
                  aria-pressed={dimension === key}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    dimension === key
                      ? "bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-[1080px] w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Gruppe</th>
                  <th className="px-4 py-3 font-bold">Boliger</th>
                  <th className="px-4 py-3 font-bold">Salgbare døgn</th>
                  <th className="px-4 py-3 font-bold">Belegg</th>
                  <th className="px-4 py-3 font-bold">ADR</th>
                  <th className="px-4 py-3 font-bold">Brutto sum</th>
                  <th className="px-4 py-3 font-bold">Snitt / bolig</th>
                  <th className="px-4 py-3 font-bold">Til eier / bolig</th>
                  <th className="px-4 py-3 font-bold">Reviewscore</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={`${row.key}-${row.month}`}>
                    <th scope="row" className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                      {row.label}
                    </th>
                    <td className="px-4 py-4 text-gray-700">{row.properties}</td>
                    <td className="px-4 py-4 text-gray-700">{integer.format(row.saleableNights)}</td>
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      {String(row.occupancyPct).replace(".", ",")} %
                    </td>
                    <td className="px-4 py-4 text-gray-700">{money(row.adr)}</td>
                    <td className="px-4 py-4 font-semibold text-gray-900">{money(row.grossTotal)}</td>
                    <td className="px-4 py-4 text-gray-700">{money(row.grossPerPropertyAvg)}</td>
                    <td className="px-4 py-4 text-gray-700">
                      {money(row.ownerPerPropertyAvg)}
                      {row.ownerPerPropertyAvg != null && (
                        <span className="mt-1 block text-xs text-gray-400">{row.ownerSampleProperties} boliger</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {row.averageRating10 == null
                        ? "For lite data"
                        : `${String(row.averageRating10).replace(".", ",")} / 10`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white/70 p-5 text-sm leading-relaxed text-gray-600">
          <p className="font-semibold text-gray-900">Hva som er med – og hva som er trukket fra</p>
          <p className="mt-2">{benchmarks.method.basis}</p>
          <p className="mt-2">{benchmarks.method.saleableNights}</p>
          <p className="mt-2">
            Små grupper skjules. Hver rad har minst {benchmarks.privacy.minimumProperties} boliger og {benchmarks.privacy.minimumStays} opphold.
            {" "}{benchmarks.privacy.rounding}
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Kilde: live Guesty-kalender, anonymiserte reservasjoner, økonomidata og {integer.format(benchmarks.coverage.reviews)} Airbnb- og Booking.com-anmeldelser i Proptonomy. Oppdatert 27. august 2026.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RentalBenchmarkCalculator;
