import { Mail, MapPin } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
	const currentYear = new Date().getFullYear();

	const footerLinks = {
		company: [
			// { name: 'Om Oss', href: '#' },
			// { name: 'Hvordan Det Virker', href: '#' },
			// { name: 'Karrierer', href: '#' },
			// { name: 'Kontakt', href: '#' },
		],
		services: [
			{ name: "Airbnb-Forvaltning", href: "#" },
			{ name: "Langtidsutleie", href: "#" },
			{ name: "Profesjonelle Tjenester", href: "#" },
			// { name: 'Eierportal', href: '/owner-portal' },
		],
		resources: [
			{
				name: "Hva kan du tjene på Airbnb?",
				href: "/hvor-mye-kan-man-tjene-pa-airbnb",
			},
			// { name: 'Investeringspartnere', href: '/investors' },
			// { name: 'Priser', href: '#' },
			// { name: 'Ofte Stilte Spørsmål', href: '#' },
			// { name: 'Blogg', href: '#' },
		],
		legal: [
			// { name: 'Personvern', href: '#' },
			// { name: 'Vilkår for Bruk', href: '#' },
			// { name: 'Informasjonskapsler', href: '#' },
		],
	};

	return (
		<footer className="bg-gray-900 text-gray-300">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
					<div className="lg:col-span-2">
						<img
							src="/heimby-logo.svg"
							alt="Heimby Logo"
							className="h-8 mb-4"
							style={{ filter: "brightness(0) invert(1)" }}
						/>
						<p className="text-sm text-gray-400 mb-6 max-w-sm">
							Forvaltning av korttidsutleie og langtidsutleie. Vi annonserer,
							priser, tar gjestene og koordinerer renhold — du beholder
							kontrollen og ser tallene i eierportalen.
						</p>

						<div className="space-y-3">
							<div className="flex items-center gap-2 text-sm">
								<Mail className="w-4 h-4 text-gray-400" />
								<a
									href="mailto:endre.jenssen@heimby.no"
									className="hover:text-white transition-colors"
								>
									endre.jenssen@heimby.no
								</a>
							</div>
							{/* <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <a
                  href="tel:+4712345678"
                  className="hover:text-white transition-colors"
                >
                  +47 123 45 678
                </a>
              </div> */}
							<div className="flex items-start gap-2 text-sm">
								<MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
								<span className="text-gray-400">Bergen, Norge</span>
							</div>
						</div>
					</div>

					<div>
						<h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
							Selskap
						</h3>
						<ul className="space-y-3">
							{footerLinks.company.map((link) => (
								<li key={link.name}>
									<a
										href={link.href}
										className="text-sm hover:text-white transition-colors"
									>
										{link.name}
									</a>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
							Tjenester
						</h3>
						<ul className="space-y-3">
							{footerLinks.services.map((link) => (
								<li key={link.name}>
									{link.href.startsWith("/") ? (
										<Link
											to={link.href}
											className="text-sm hover:text-white transition-colors"
										>
											{link.name}
										</Link>
									) : (
										<a
											href={link.href}
											className="text-sm hover:text-white transition-colors"
										>
											{link.name}
										</a>
									)}
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
							Ressurser
						</h3>
						<ul className="space-y-3">
							{footerLinks.resources.map((link) => (
								<li key={link.name}>
									{link.href.startsWith("/") ? (
										<Link
											to={link.href}
											className="text-sm hover:text-white transition-colors"
										>
											{link.name}
										</Link>
									) : (
										<a
											href={link.href}
											className="text-sm hover:text-white transition-colors"
										>
											{link.name}
										</a>
									)}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			<div className="border-t border-gray-800">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
						<p className="text-sm text-gray-400">
							© {currentYear} Heimby. Alle rettigheter reservert.
						</p>

						<div className="flex flex-wrap justify-center gap-6">
							{footerLinks.legal.map((link) => (
								<a
									key={link.name}
									href={link.href}
									className="text-sm text-gray-400 hover:text-white transition-colors"
								>
									{link.name}
								</a>
							))}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
