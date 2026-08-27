import { ArrowRight, Mail, MapPin } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const footerLinks = {
	services: [
		{ name: "Korttidsutleie og Airbnb", href: "/#korttidsutleie" },
		{ name: "Langtidsutleie", href: "/#langtidsutleie" },
		{ name: "Dynamisk utleie (10-2)", href: "/#dynamisk-utleie" },
		{ name: "Drift og vedlikehold", href: "/#driftstjenester" },
	],
	resources: [
		{
			name: "Airbnb-inntekt: tall og eksempler",
			href: "/hvor-mye-kan-man-tjene-pa-airbnb",
		},
		{ name: "Regler for korttidsutleie", href: "/korttidsutleie-regler" },
		{ name: "Alle nyheter og guider", href: "/nyheter" },
		{
			name: "Airbnb-guide: regler og sjekkliste",
			href: "/nyheter/slik-leier-du-ut-boligen-pa-airbnb",
		},
	],
	locations: [
		{ name: "Bergen", href: "/korttidsutleie-i-bergen" },
		{ name: "Oslo", href: "/korttidsutleie-i-oslo" },
		{ name: "Stavanger", href: "/korttidsutleie-i-stavanger" },
		{ name: "Trondheim", href: "/korttidsutleie-i-trondheim" },
		{ name: "Tromsø", href: "/korttidsutleie-i-tromso" },
		{ name: "Haugesund", href: "/korttidsutleie-i-haugesund" },
		{ name: "Kristiansand", href: "/korttidsutleie-i-kristiansand" },
	],
};

const FooterLinkGroup = ({ title, links, compactOnMobile = false }) => (
	<nav aria-label={title}>
		<h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white">
			{title}
		</h3>
		<ul
			className={
				compactOnMobile
					? "grid grid-cols-2 gap-x-6 sm:block sm:space-y-0 lg:space-y-3"
					: "space-y-0 lg:space-y-3"
			}
		>
			{links.map((link) => (
				<li key={link.name}>
					<Link
						to={link.href}
						className="inline-flex min-h-11 items-center text-sm leading-6 text-gray-400 transition-colors hover:text-white focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:min-h-6"
					>
						{link.name}
					</Link>
				</li>
			))}
		</ul>
	</nav>
);

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-gray-900 text-gray-300">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-6 border-b border-white/10 py-10 sm:flex-row sm:items-center sm:justify-between sm:py-12">
					<div className="max-w-xl">
						<p className="mb-2 text-sm font-medium text-gray-400">
							Klar for å få mer ut av boligen?
						</p>
						<h2 className="text-2xl font-medium tracking-tight text-white sm:text-3xl">
							Se hva boligen din kan tjene med Heimby.
						</h2>
					</div>
					<Link
						to="/#lead-gen"
						className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200 focus-visible:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
					>
						Få et uforpliktende estimat
						<ArrowRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				</div>

				<div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-3 sm:py-16 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-12">
					<div className="sm:col-span-3 lg:col-span-1">
						<Link
							to="/"
							aria-label="Heimby – forsiden"
							className="inline-flex min-h-11 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
						>
							<img
								src="/heimby-logo.svg"
								alt="Heimby"
								className="mb-5 h-8"
								style={{ filter: "brightness(0) invert(1)" }}
							/>
						</Link>
						<p className="max-w-sm text-sm leading-6 text-gray-400">
							Heimby forvalter korttids-, langtids- og dynamisk utleie. Vi
							tar oss av prising, gjester, renhold og vedlikehold – du følger
							inntekter og drift i eierportalen.
						</p>

						<div className="mt-6 space-y-3 text-sm">
							<a
								href="mailto:endre.jenssen@heimby.no"
								className="flex min-h-11 w-fit items-center gap-2 text-gray-300 transition-colors hover:text-white focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:min-h-6"
							>
								<Mail className="h-4 w-4 text-gray-500" aria-hidden="true" />
								endre.jenssen@heimby.no
							</a>
							<div className="flex items-center gap-2 text-gray-400">
								<MapPin className="h-4 w-4 text-gray-500" aria-hidden="true" />
								<span>Lokale team i norske byer</span>
							</div>
						</div>
					</div>

					<FooterLinkGroup title="Tjenester" links={footerLinks.services} />
					<FooterLinkGroup title="Ressurser" links={footerLinks.resources} />
					<FooterLinkGroup
						title="Områder"
						links={footerLinks.locations}
						compactOnMobile
					/>
				</div>
			</div>

			<div className="border-t border-gray-800">
				<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
					<p className="text-sm text-gray-400">
						© {currentYear} Heimby. Alle rettigheter reservert.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
