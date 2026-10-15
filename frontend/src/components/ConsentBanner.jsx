import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Samtykke til informasjonskapsler (ekomloven § 3-15 og GDPR). Statistikk (counter.dev) og
// markedsføring (Meta-pikselen) lastes bare etter ja, av window.heimbyBrukSamtykke i public/index.html.
// Nei skal være like lett som ja, og valget kan endres når som helst fra bunnteksten.
export const SAMTYKKE_NOKKEL = "heimby-samtykke";
const VERSJON = 1;
const GYLDIG_MS = 365 * 24 * 60 * 60 * 1000; // spør på nytt etter 12 måneder

export function lesSamtykke() {
	try {
		const v = JSON.parse(window.localStorage.getItem(SAMTYKKE_NOKKEL));
		if (!v || v.versjon !== VERSJON) return null;
		if (Date.now() - new Date(v.tidspunkt).getTime() > GYLDIG_MS) return null;
		return v;
	} catch {
		return null;
	}
}

export function visSamtykkevalg() {
	window.dispatchEvent(new Event("heimby-vis-samtykke"));
}

function lagreSamtykke({ statistikk, markedsforing }) {
	const v = {
		versjon: VERSJON,
		statistikk: Boolean(statistikk),
		markedsforing: Boolean(markedsforing),
		tidspunkt: new Date().toISOString(),
	};
	try {
		window.localStorage.setItem(SAMTYKKE_NOKKEL, JSON.stringify(v));
	} catch {
		// Uten lagring spør vi igjen ved neste besøk
	}
	window.heimbyBrukSamtykke?.(v);
}

const knapp =
	"inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900";

const Valg = ({ id, tittel, tekst, checked, disabled, onChange }) => (
	<label htmlFor={id} className="flex items-start gap-3 py-2">
		<input
			id={id}
			type="checkbox"
			className="mt-1 h-4 w-4 accent-gray-900"
			checked={checked}
			disabled={disabled}
			onChange={(e) => onChange?.(e.target.checked)}
		/>
		<span>
			<span className="block text-sm font-medium text-gray-900">{tittel}</span>
			<span className="block text-sm text-gray-600">{tekst}</span>
		</span>
	</label>
);

const ConsentBanner = () => {
	const [synlig, setSynlig] = useState(false);
	const [detaljer, setDetaljer] = useState(false);
	const [statistikk, setStatistikk] = useState(false);
	const [markedsforing, setMarkedsforing] = useState(false);

	useEffect(() => {
		if (!lesSamtykke()) setSynlig(true);
		const vis = () => {
			const v = lesSamtykke();
			setStatistikk(Boolean(v?.statistikk));
			setMarkedsforing(Boolean(v?.markedsforing));
			setDetaljer(true);
			setSynlig(true);
		};
		window.addEventListener("heimby-vis-samtykke", vis);
		return () => window.removeEventListener("heimby-vis-samtykke", vis);
	}, []);

	if (!synlig) return null;

	const lagre = (valg) => {
		lagreSamtykke(valg);
		setSynlig(false);
		setDetaljer(false);
	};

	return (
		<div
			role="dialog"
			aria-modal="false"
			aria-labelledby="samtykke-tittel"
			className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4"
		>
			<div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
				<h2 id="samtykke-tittel" className="text-base font-semibold text-gray-900">
					Informasjonskapsler
				</h2>
				<p className="mt-2 text-sm leading-6 text-gray-600">
					Vil du at vi bruker informasjonskapsler til statistikk og til å måle
					annonsene våre på Facebook og Instagram? Nettsiden virker like godt
					om du sier nei. Du kan endre valget når som helst nederst på siden.{" "}
					<Link to="/personvern" className="underline text-gray-900">
						Les personvernerklæringen
					</Link>
					.
				</p>

				{detaljer && (
					<div className="mt-3 border-t border-gray-100 pt-2">
						<Valg
							id="samtykke-nodvendig"
							tittel="Nødvendige"
							tekst="Husker valget ditt. Alltid på."
							checked
							disabled
						/>
						<Valg
							id="samtykke-statistikk"
							tittel="Statistikk"
							tekst="Teller besøk med counter.dev. Vi ser ikke hvem du er."
							checked={statistikk}
							onChange={setStatistikk}
						/>
						<Valg
							id="samtykke-markedsforing"
							tittel="Markedsføring"
							tekst="Meta-pikselen måler annonsene våre på Facebook og Instagram."
							checked={markedsforing}
							onChange={setMarkedsforing}
						/>
					</div>
				)}

				<div className="mt-4 flex flex-col gap-2 sm:flex-row">
					<button
						type="button"
						className={knapp}
						onClick={() => lagre({ statistikk: false, markedsforing: false })}
					>
						Avvis alle
					</button>
					<button
						type="button"
						className={knapp}
						onClick={() => lagre({ statistikk: true, markedsforing: true })}
					>
						Godta alle
					</button>
				</div>
				<div className="mt-3 text-center">
					{detaljer ? (
						<button
							type="button"
							className="text-sm font-medium text-gray-900 underline"
							onClick={() => lagre({ statistikk, markedsforing })}
						>
							Lagre valgene mine
						</button>
					) : (
						<button
							type="button"
							className="text-sm font-medium text-gray-900 underline"
							onClick={() => setDetaljer(true)}
						>
							Velg selv
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default ConsentBanner;
