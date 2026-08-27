import { ArrowUpRight, Check } from "lucide-react";

const GuideLink = ({ href, children }) => {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex items-center gap-1.5 font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
    >
      {children}
      <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
    </a>
  );
};

const BulletList = ({ items }) => (
  <ul className="space-y-3">
    {items.map((item) => (
      <li key={item} className="flex gap-3 text-base leading-relaxed text-gray-700">
        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white">
          <Check className="h-3 w-3" aria-hidden="true" />
        </span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const GuideCard = ({ card }) => {
  const links = card.links ||
    (card.link ? [{ label: card.linkLabel, url: card.link }] : []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-7">
      {card.badge && (
        <span className="mb-4 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
          {card.badge}
        </span>
      )}
      <h3 className="mb-3 text-xl font-bold leading-snug text-gray-900">
        {card.title}
      </h3>
      {card.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="mb-4 text-base leading-relaxed text-gray-700 last:mb-0">
          {paragraph}
        </p>
      ))}
      {card.bullets && <BulletList items={card.bullets} />}
      {links.length > 0 && (
        <div className="mt-5 flex flex-col items-start gap-3 text-sm">
          {links.map((link) => (
            <GuideLink key={link.url} href={link.url}>
              {link.label}
            </GuideLink>
          ))}
        </div>
      )}
    </div>
  );
};

const NewsGuideContent = ({ guide }) => (
  <div>
    <div className="space-y-5 text-lg leading-relaxed text-gray-700">
      {guide.intro.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>

    <aside className="my-10 rounded-2xl bg-gray-900 p-7 text-white md:p-9">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
        Ferieutleie
      </p>
      <h2 className="mb-4 text-2xl font-bold leading-tight md:text-3xl">
        {guide.highlight.title}
      </h2>
      <p className="text-base leading-relaxed text-white/85 md:text-lg">
        {guide.highlight.body}
      </p>
      <a
        href="/#lead-gen"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-100"
      >
        Få et gratis utleieestimat
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </aside>

    <nav aria-label="Innhold i guiden" className="mb-14 rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-8">
      <h2 className="mb-4 text-lg font-bold text-gray-900">I denne guiden</h2>
      <ol className="grid gap-3 md:grid-cols-2">
        {guide.sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="font-medium leading-snug text-gray-700 underline decoration-gray-300 underline-offset-4 hover:text-gray-900 hover:decoration-gray-900"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>

    <div className="space-y-16">
      {guide.sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-28">
          <h2 className="mb-4 text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
            {section.title}
          </h2>
          {section.intro && (
            <p className="mb-7 text-lg leading-relaxed text-gray-700">
              {section.intro}
            </p>
          )}
          {section.cards && (
            <div className="grid gap-5">
              {section.cards.map((card) => (
                <GuideCard key={card.title} card={card} />
              ))}
            </div>
          )}
          {section.bullets && <BulletList items={section.bullets} />}
          {section.links && (
            <div className="mt-6 flex flex-col items-start gap-3">
              {section.links.map((link) => (
                <GuideLink key={link.url} href={link.url}>
                  {link.label}
                </GuideLink>
              ))}
            </div>
          )}
          {section.note && (
            <p className="mt-6 border-l-4 border-gray-900 bg-gray-50 px-5 py-4 text-base leading-relaxed text-gray-700">
              <strong className="text-gray-900">Husk: </strong>
              {section.note}
            </p>
          )}
        </section>
      ))}
    </div>

    <section className="my-16 rounded-2xl bg-[#F0EFE9] p-7 md:p-9">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        {guide.checklist.title}
      </h2>
      <BulletList items={guide.checklist.items} />
    </section>

    <section className="mb-16">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Ofte stilte spørsmål
      </h2>
      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {guide.faqs.map((faq) => (
          <details key={faq.question} className="group py-5">
            <summary className="cursor-pointer list-none pr-8 text-lg font-semibold text-gray-900 marker:hidden">
              {faq.question}
            </summary>
            <p className="pt-3 text-base leading-relaxed text-gray-700">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>

    <section className="border-t border-gray-200 pt-8">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Kilder og videre lesning</h2>
      <ul className="space-y-3 text-sm">
        {guide.sources.map((source) => (
          <li key={source.url}>
            <GuideLink href={source.url}>{source.label}</GuideLink>
          </li>
        ))}
      </ul>
      <p className="mt-7 text-sm leading-relaxed text-gray-500">
        {guide.disclaimer}
      </p>
    </section>
  </div>
);

export default NewsGuideContent;
