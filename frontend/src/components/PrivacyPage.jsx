import { useEffect } from "react";
import { Helmet } from "react-helmet";
import content from "../data/personvern.json";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { visSamtykkevalg } from "./ConsentBanner";

const PAGE_URL = "https://heimby.no/personvern/";

const formatDate = (iso) =>
	new Date(`${iso}T12:00:00`).toLocaleDateString("nb-NO", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});

const PrivacyPage = () => {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<>
			<Helmet>
				<title>{content.title}</title>
				<meta name="description" content={content.metaDescription} />
				<meta property="og:title" content={content.title} />
				<meta property="og:description" content={content.metaDescription} />
				<meta property="og:url" content={PAGE_URL} />
				<link rel="canonical" href={PAGE_URL} />
			</Helmet>

			<div className="App">
				<Navbar solid />

				<main className="pt-28 pb-16 px-6" style={{ backgroundColor: "#FFFFFF" }}>
					<div className="max-w-3xl mx-auto">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
							{content.h1}
						</h1>
						<p className="text-sm text-gray-500 mb-8">
							Sist oppdatert {formatDate(content.lastUpdated)}
						</p>
						{content.intro.map((para) => (
							<p key={para} className="text-lg text-gray-700 leading-relaxed mb-5">
								{para}
							</p>
						))}

						{content.sections.map((s) => (
							<section key={s.id} id={s.id} className="mt-10">
								<h2 className="text-2xl font-bold text-gray-900 mb-3">{s.title}</h2>
								{s.paragraphs?.map((p) => (
									<p key={p} className="text-base text-gray-700 leading-relaxed mb-4">
										{p}
									</p>
								))}
								{s.list && (
									<ul className="list-disc pl-6 space-y-2 mb-4 text-base text-gray-700 leading-relaxed">
										{s.list.map((item) => (
											<li key={item}>{item}</li>
										))}
									</ul>
								)}
								{s.after && (
									<p className="text-base text-gray-700 leading-relaxed mb-4">{s.after}</p>
								)}
								{s.basis && (
									<p className="text-base text-gray-700 leading-relaxed mb-4">{s.basis}</p>
								)}
								{s.storage && (
									<p className="text-base text-gray-700 leading-relaxed mb-4">
										<strong>Lagringstid:</strong> {s.storage}
									</p>
								)}
							</section>
						))}

						<section id="informasjonskapsler" className="mt-10">
							<h2 className="text-2xl font-bold text-gray-900 mb-3">
								{content.cookies.title}
							</h2>
							<p className="text-base text-gray-700 leading-relaxed mb-4">
								{content.cookies.intro}
							</p>
							<div className="overflow-x-auto">
								<table className="w-full text-sm text-left text-gray-700 border-collapse">
									<thead>
										<tr className="border-b border-gray-200">
											<th className="py-2 pr-4 font-semibold">Navn</th>
											<th className="py-2 pr-4 font-semibold">Fra</th>
											<th className="py-2 pr-4 font-semibold">Formål</th>
											<th className="py-2 pr-4 font-semibold">Type</th>
											<th className="py-2 font-semibold">Varighet</th>
										</tr>
									</thead>
									<tbody>
										{content.cookies.rows.map((r) => (
											<tr key={r.name} className="border-b border-gray-100 align-top">
												<td className="py-2 pr-4 font-mono">{r.name}</td>
												<td className="py-2 pr-4">{r.provider}</td>
												<td className="py-2 pr-4">{r.purpose}</td>
												<td className="py-2 pr-4">{r.category}</td>
												<td className="py-2">{r.duration}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<p className="text-base text-gray-700 leading-relaxed mt-4 mb-4">
								{content.cookies.after}
							</p>
							<button
								type="button"
								onClick={visSamtykkevalg}
								className="inline-flex min-h-11 items-center rounded-full border-2 border-gray-900 px-5 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
							>
								Endre valget ditt om informasjonskapsler
							</button>
						</section>

						<section className="mt-10">
							<h2 className="text-2xl font-bold text-gray-900 mb-3">Endringer</h2>
							<p className="text-base text-gray-700 leading-relaxed">{content.changes}</p>
						</section>
					</div>
				</main>

				<Footer />
			</div>
		</>
	);
};

export default PrivacyPage;
