import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const OurPresenceSection = () => {
  const norwayLocations = [
    { name: "Stavanger", slug: "stavanger" },
    { name: "Bergen", slug: "bergen" },
    { name: "Oslo", slug: "oslo" },
    { name: "Trondheim", slug: "trondheim" },
    { name: "Bodø", slug: null },
    { name: "Tromsø", slug: "tromso" },
    { name: "Haugesund", slug: "haugesund" },
    { name: "Kristiansand", slug: "kristiansand" },
  ];

  return (
    <section
      className="relative py-0 px-0 sm:px-6"
      style={{ backgroundColor: "#F9F8F4" }}
    >
      <div
        className="relative min-h-[600px] mx-auto"
        style={{ maxWidth: "100%" }}
      >
        <img
          src="/img/create-a-mix-of-no-1.jpg"
          alt="Norway Properties"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative max-w-6xl mx-auto py-16 px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div
              className="rounded-2xl shadow-2xl p-8 md:p-12 flex flex-col gap-6"
              style={{ backgroundColor: "#ededed" }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Størst på korttidsutleie i Bergen — og voksende
              </h2>

              <p className="text-lg text-gray-700 leading-relaxed">
                Heimby forvalter rundt 160 leiligheter for andre boligeiere og
                har flest aktive Airbnb-annonser i Bergen. Vi drifter med eget
                lokalt apparat for renhold, nøkler og vedlikehold.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">🇳🇴</span>
                    <h3 className="text-xl font-bold text-gray-900">Norge</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {norwayLocations.map((location, index) => {
                      const Component = location.slug ? Link : "div";
                      const props = location.slug
                        ? { to: `/korttidsutleie-i-${location.slug}` }
                        : {};

                      return (
                        <Component
                          key={index}
                          {...props}
                          className={`flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200 ${
                            location.slug
                              ? "hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all"
                              : ""
                          }`}
                        >
                          <MapPin className="w-4 h-4 text-gray-700" />
                          <span className="text-sm font-medium text-gray-900">
                            {location.name}
                          </span>
                        </Component>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">🌍</span>
                    <h3 className="text-xl font-bold text-gray-900">
                      Ekspansjon
                    </h3>
                  </div>
                  <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                    <p className="text-base font-medium text-gray-900">
                      Vi ser aktivt på muligheter i nye markeder
                    </p>
                    <p className="text-sm text-gray-600">
                      Europeisk ekspansjon planlegges
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-base text-gray-600 font-light italic mt-4">
                Lokale team. Lokal ekspertise. Konsistent kvalitet.
              </p>
            </div>

            <div></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurPresenceSection;
