import {
  ArrowRight,
  Banknote,
  Bath,
  BedDouble,
  CalendarDays,
  Gauge,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import benchmarks from "../data/rentalBenchmarks.json";

const bedroomLabels = {
  all: "Alle størrelser",
  studio: "Studio",
  1: "1 soverom",
  2: "2 soverom",
  3: "3 soverom",
  "4+": "4+ soverom",
};

const bathroomLabels = {
  all: "Alle bad",
  1: "1 bad",
  "2+": "2+ bad",
};

const bedroomOrder = ["all", "studio", "1", "2", "3", "4+"];
const bathroomOrder = ["all", "1", "2+"];

const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const money = (value) => nok.format(value);

const latestMonth = (rows) => Math.max(...rows.map((row) => row.month));

const Range = ({ metric, suffix = "" }) => (
  <p className="mt-2 text-sm leading-relaxed text-gray-500">
    Midtre 50 %: {suffix ? `${metric.low}${suffix}–${metric.high}${suffix}` : `${money(metric.low)}–${money(metric.high)}`}
  </p>
);

const MetricCard = ({ icon: Icon, label, value, metric, suffix, note, featured = false }) => (
  <div
    className={`rounded-2xl border p-5 md:p-6 ${
      featured
        ? "border-gray-900 bg-gray-900 text-white"
        : "border-gray-200 bg-white text-gray-900"
    }`}
  >
    <div className="mb-5 flex items-center gap-2">
      <Icon className={`h-5 w-5 ${featured ? "text-white/70" : "text-gray-500"}`} />
      <span className={`text-sm font-semibold ${featured ? "text-white/70" : "text-gray-600"}`}>
        {label}
      </span>
    </div>
    <p className="text-3xl font-bold tracking-tight md:text-4xl">{value}</p>
    <div className={featured ? "[&>p]:text-white/60" : ""}>
      <Range metric={metric} suffix={suffix} />
    </div>
    {note && (
      <p className={`mt-3 text-xs leading-relaxed ${featured ? "text-white/55" : "text-gray-500"}`}>
        {note}
      </p>
    )}
  </div>
);

const RentalBenchmarkCalculator = () => {
  const [city, setCity] = useState("Bergen");
  const [bedrooms, setBedrooms] = useState("2");
  const [bathrooms, setBathrooms] = useState("1");
  const [month, setMonth] = useState(7);

  const cities = useMemo(
    () => [...new Set(benchmarks.cohorts.map((row) => row.city))],
    [],
  );

  const cityRows = benchmarks.cohorts.filter((row) => row.city === city);
  const bedroomOptions = bedroomOrder.filter((value) =>
    cityRows.some((row) => row.bedrooms === value),
  );
  const bedroomRows = cityRows.filter((row) => row.bedrooms === bedrooms);
  const bathroomOptions = bathroomOrder.filter((value) =>
    bedroomRows.some((row) => row.bathrooms === value),
  );
  const selectionRows = bedroomRows.filter((row) => row.bathrooms === bathrooms);
  const monthOptions = [...new Map(selectionRows.map((row) => [row.month, row.monthLabel])).entries()]
    .sort(([first], [second]) => first - second);
  const cohort =
    selectionRows.find((row) => row.month === month) ||
    selectionRows[selectionRows.length - 1];

  const changeCity = (event) => {
    const nextCity = event.target.value;
    const nextRows = benchmarks.cohorts.filter(
      (row) => row.city === nextCity && row.bedrooms === "all" && row.bathrooms === "all",
    );
    setCity(nextCity);
    setBedrooms("all");
    setBathrooms("all");
    setMonth(latestMonth(nextRows));
  };

  const changeBedrooms = (event) => {
    const nextBedrooms = event.target.value;
    const nextRows = benchmarks.cohorts.filter(
      (row) =>
        row.city === city && row.bedrooms === nextBedrooms && row.bathrooms === "all",
    );
    setBedrooms(nextBedrooms);
    setBathrooms("all");
    setMonth(latestMonth(nextRows));
  };

  const changeBathrooms = (event) => {
    const nextBathrooms = event.target.value;
    const nextRows = benchmarks.cohorts.filter(
      (row) =>
        row.city === city &&
        row.bedrooms === bedrooms &&
        row.bathrooms === nextBathrooms,
    );
    setBathrooms(nextBathrooms);
    setMonth(latestMonth(nextRows));
  };

  if (!cohort) return null;

  return (
    <section id="inntektskalkulator" className="px-6 py-16 md:py-20" style={{ backgroundColor: "#F9F8F4" }}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-9 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gray-700">
            <Sparkles className="h-3.5 w-3.5" />
            {benchmarks.title}
          </div>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            Se hva lignende boliger faktisk leverte
          </h2>
          <p className="text-lg leading-relaxed text-gray-700">
            Velg marked og boligtype. Vi viser medianen fra {benchmarks.coverage.stays.toLocaleString("nb-NO")} opphold i {benchmarks.coverage.properties} anonymiserte boliger – ikke et teoretisk toppscenario.
          </p>
        </div>

        <div className="mb-6 grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4 md:p-6">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MapPin className="h-4 w-4" /> Marked
            </span>
            <select
              value={city}
              onChange={changeCity}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            >
              {cities.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <BedDouble className="h-4 w-4" /> Størrelse
            </span>
            <select
              value={bedrooms}
              onChange={changeBedrooms}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            >
              {bedroomOptions.map((value) => (
                <option key={value} value={value}>{bedroomLabels[value]}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Bath className="h-4 w-4" /> Bad
            </span>
            <select
              value={bathrooms}
              onChange={changeBathrooms}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            >
              {bathroomOptions.map((value) => (
                <option key={value} value={value}>{bathroomLabels[value]}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <CalendarDays className="h-4 w-4" /> Måned
            </span>
            <select
              value={cohort.month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            >
              {monthOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4">
          <p className="font-semibold text-gray-900">
            {cohort.properties} boliger · {cohort.stays} opphold
          </p>
          <p className="text-sm text-gray-500">Median · midtre 50 % vises som intervall</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            icon={Gauge}
            label="ADR · døgnpris"
            value={money(cohort.adr.median)}
            metric={cohort.adr}
            note="Losjiinntekt per solgte natt, uten renholdsgebyr og skatter."
          />
          <MetricCard
            icon={CalendarDays}
            label="Belegg"
            value={`${cohort.occupancy.median} %`}
            metric={cohort.occupancy}
            suffix=" %"
            note="Eierblokkerte dager er ikke trukket fra."
          />
          <MetricCard
            icon={Banknote}
            label="Bruttoinntekt"
            value={money(cohort.grossIncome.median)}
            metric={cohort.grossIncome}
            note="Losji, gjestebetalt renhold og gjesteskatter før kostnader."
          />
          <MetricCard
            icon={Banknote}
            label="Estimert til eier"
            value={money(cohort.ownerIncome.median)}
            metric={cohort.ownerIncome}
            featured
            note="Etter standard drift og forvaltning, før skatt og ekstra vedlikehold."
          />
          <MetricCard
            icon={Sparkles}
            label="Renhold per utsjekk"
            value={money(cohort.cleaningPerCheckout.median)}
            metric={cohort.cleaningPerCheckout}
            note="Standard turnover-kostnad; søndag og helligdag kan koste mer."
          />
          <div className="flex flex-col justify-between rounded-2xl border border-dashed border-gray-400 bg-white/60 p-5 md:p-6">
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-600">Vil du ha ditt eget regnestykke?</p>
              <p className="text-xl font-bold leading-snug text-gray-900">
                Vi bruker adresse, standard og tilgjengelige datoer for et mer presist estimat.
              </p>
            </div>
            <a
              href="#lead-gen"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
            >
              Få gratis estimat <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-7 rounded-xl border border-gray-200 bg-white/70 p-5 text-sm leading-relaxed text-gray-600">
          <p className="mb-2 font-semibold text-gray-900">Slik leser du tallene</p>
          <p>
            Dataperiode: {benchmarks.period.label}. Små grupper skjules; hver visning bygger på minst {benchmarks.privacy.minimumProperties} boliger og {benchmarks.privacy.minimumStays} opphold. Historiske tall er ikke en garanti for fremtidig inntekt.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Kilde: anonymiserte reservasjons- og økonomidata fra Proptonomy, kvalitetssikret mot Heimbys oppgjørsdata for 2026. Oppdatert 27. august 2026.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RentalBenchmarkCalculator;
