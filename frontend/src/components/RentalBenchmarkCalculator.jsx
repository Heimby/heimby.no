import {
  Banknote,
  BedDouble,
  Building2,
  CalendarCheck,
  CalendarDays,
  Gauge,
  MapPin,
} from "lucide-react";
import { useMemo, useState } from "react";
import benchmarks from "../data/rentalBenchmarks.json";

const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const money = (value) => (value == null ? "Ikke publisert" : nok.format(value));

const dimensions = [
  { key: "city", label: "By og marked", icon: MapPin },
  { key: "bedrooms", label: "Antall soverom", icon: BedDouble },
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

const ScenarioCard = ({ eyebrow, title, value, highlighted = false }) => (
  <div
    className={`rounded-2xl border p-5 md:p-6 ${
      highlighted
        ? "border-gray-900 bg-gray-900 text-white"
        : "border-gray-200 bg-white text-gray-900"
    }`}
  >
    <p className={`text-xs font-bold uppercase tracking-[0.16em] ${highlighted ? "text-white/60" : "text-gray-500"}`}>
      {eyebrow}
    </p>
    <h4 className="mt-2 text-lg font-bold">{title}</h4>
    <p className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">{money(value)}</p>
    <p className={`mt-1 text-sm ${highlighted ? "text-white/65" : "text-gray-500"}`}>
      beregnet til eier per bolig
    </p>
  </div>
);

const RentalBenchmarkCalculator = () => {
  const [month, setMonth] = useState(8);
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
            Anonymiserte nøkkeltall og eksempler per aktiv bolig
          </p>
          <p className="text-sm text-gray-500">{selectedMonth.label} 2026</p>
        </div>

        <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-950">
          Belegget beregnes bare av døgn boligen faktisk kunne selges. Tid før annonsen
          åpnet, eierblokker og andre stengte døgn registreres ikke som tomgang.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={Banknote}
            label="Brutto per bolig"
            value={money(overall.grossPerPropertyAvg)}
            note={`Avrundet gruppesnitt. Midtre 50 %: ${money(overall.grossPerPropertyP25)}–${money(overall.grossPerPropertyP75)}.`}
            dark
          />
          <SummaryCard
            icon={Building2}
            label="Beregnet til eier per bolig"
            value={money(overall.ownerIncomePerPropertyAvg)}
            note={`Etter Airbnb/Booking.com, Heimby og renhold. Midtre 50 %: ${money(overall.ownerIncomePerPropertyP25)}–${money(overall.ownerIncomePerPropertyP75)}.`}
          />
          <SummaryCard
            icon={Gauge}
            label="Belegg av salgbare døgn"
            value={`${String(overall.occupancyPct).replace(".", ",")} %`}
            note="Bookede Airbnb- og Booking.com-døgn delt på døgn boligene faktisk var åpne for salg."
          />
          <SummaryCard
            icon={CalendarDays}
            label="ADR"
            value={money(overall.adr)}
            note="Vektet losjiinntekt per Airbnb- og Booking.com-natt."
          />
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                Kostnader per aktiv bolig
              </p>
              <h3 className="mt-1 text-xl font-bold text-gray-900">
                Fra bruttoinntekt til beregnet eierinntekt
              </h3>
            </div>
            <p className="text-sm text-gray-500">Gjennomsnitt · {selectedMonth.label} 2026</p>
          </div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Bruttoinntekt", overall.grossPerPropertyAvg, false],
              ["Airbnb / Booking.com", overall.platformCommissionPerPropertyAvg, true],
              ["Heimby inkl. MVA", overall.heimbyCommissionPerPropertyAvg, true],
              ["Renhold inkl. MVA", overall.cleaningCostPerPropertyAvg, true],
              ["Beregnet til eier", overall.ownerIncomePerPropertyAvg, false],
            ].map(([label, value, deduction], index) => (
              <div
                key={label}
                className={`rounded-xl px-4 py-4 ${index === 4 ? "bg-emerald-50" : "bg-gray-50"}`}
              >
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
                <dd className={`mt-2 text-xl font-bold ${index === 4 ? "text-emerald-900" : "text-gray-900"}`}>
                  {deduction ? "−" : ""}{money(value)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            Plattformkommisjonen er registrert vertskommisjon fra Airbnb eller Booking.com.
            Eierbeløpet er før skatt, vedlikehold, skader, refusjoner og andre individuelle kostnader.
          </p>
        </div>

        <div className="mt-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Tre historiske nivåer</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
            Hva kan én bolig sitte igjen med?
          </h3>
          <p className="mt-3 max-w-3xl leading-relaxed text-gray-600">
            Eksemplene viser nedre kvartil, median og øvre kvartil for måneden. De er
            anonymiserte og avrundede beregninger per bolig etter de tre viste kostnadene,
            ikke et inntektsløfte eller et individuelt eieroppgjør.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ScenarioCard
              eyebrow="Nedre kvartil"
              title="Forsiktig eksempel"
              value={overall.ownerIncomePerPropertyP25}
            />
            <ScenarioCard
              eyebrow="Median"
              title="Typisk eksempel"
              value={overall.ownerIncomePerPropertyMedian}
              highlighted
            />
            <ScenarioCard
              eyebrow="Øvre kvartil"
              title="Sterkt eksempel"
              value={overall.ownerIncomePerPropertyP75}
            />
          </div>
          <div className="mt-4 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm leading-relaxed text-gray-600">
            Kostnadene er anonymiserte snitt per bolig. Porteføljesummer, eksakte
            utvalgsstørrelser og individuelle eieroppgjør publiseres ikke. Kontakt Heimby
            for en beregning tilpasset din bolig.
          </div>
        </div>

        <div className="mt-14">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Sammenlign gruppene</p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
                Statistikk per by og størrelse
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
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Gruppe</th>
                  <th className="px-4 py-3 font-bold">Belegg</th>
                  <th className="px-4 py-3 font-bold">ADR</th>
                  <th className="px-4 py-3 font-bold">Brutto / bolig</th>
                  <th className="px-4 py-3 font-bold">Airbnb / Booking.com</th>
                  <th className="px-4 py-3 font-bold">Heimby inkl. MVA</th>
                  <th className="px-4 py-3 font-bold">Renhold inkl. MVA</th>
                  <th className="px-4 py-3 font-bold">Til eier / bolig</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={`${row.key}-${row.month}`}>
                    <th scope="row" className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                      {row.label}
                    </th>
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      {String(row.occupancyPct).replace(".", ",")} %
                    </td>
                    <td className="px-4 py-4 text-gray-700">{money(row.adr)}</td>
                    <td className="px-4 py-4 text-gray-700">
                      <span className="font-semibold text-gray-900">{money(row.grossPerPropertyAvg)}</span>
                      <span className="mt-1 block text-xs text-gray-400">
                        Midtre 50 %: {money(row.grossPerPropertyP25)}–{money(row.grossPerPropertyP75)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{money(row.platformCommissionPerPropertyAvg)}</td>
                    <td className="px-4 py-4 text-gray-700">{money(row.heimbyCommissionPerPropertyAvg)}</td>
                    <td className="px-4 py-4 text-gray-700">{money(row.cleaningCostPerPropertyAvg)}</td>
                    <td className="px-4 py-4 text-gray-700">
                      <span className="font-semibold text-gray-900">{money(row.ownerIncomePerPropertyAvg)}</span>
                      <span className="mt-1 block text-xs text-gray-400">
                        Midtre 50 %: {money(row.ownerIncomePerPropertyP25)}–{money(row.ownerIncomePerPropertyP75)}
                      </span>
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
          <p className="mt-2">{benchmarks.method.availability}</p>
          <p className="mt-2">{benchmarks.method.platformCommission}</p>
          <p className="mt-2">{benchmarks.method.heimbyCommission}</p>
          <p className="mt-2">{benchmarks.method.cleaningCost}</p>
          <p className="mt-2">{benchmarks.method.ownerIncome}</p>
          <p className="mt-2">{benchmarks.privacy.groupRule} {benchmarks.privacy.rounding}</p>
          <p className="mt-3 text-xs text-gray-500">
            Kilde: live Guesty-kalender og anonymiserte reservasjons-, kostnads- og
            markedstall i Proptonomy. Oppdatert 27. august 2026.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RentalBenchmarkCalculator;
