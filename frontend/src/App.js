import React, { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import AdminDashboard from "./components/AdminDashboard";
import FAQSection from "./components/FAQSection";
import CityPage from "./components/CityPage";
import DataPage from "./components/DataPage";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import InvestorPage from "./components/InvestorPage";
import JourneyBanner from "./components/JourneyBanner";
import LeadGenSection from "./components/LeadGenSection";
import LoginPage from "./components/LoginPage";
import MediaSection from "./components/MediaSection";
import Navbar from "./components/Navbar";
import NewsArticlePage from "./components/NewsArticlePage";
import NewsIndexPage from "./components/NewsIndexPage";
import OurPresenceSection from "./components/OurPresenceSection";
import OwnerPortalDashboard from "./components/OwnerPortalDashboard";
import PricingSection from "./components/PricingSection";
import ProcessTimelineSection from "./components/ProcessTimelineSection";
import RulesPage from "./components/RulesPage";
import ProfessionalServicesSection from "./components/ProfessionalServicesSection";
import PropertyDocumentation from "./components/PropertyDocumentation";
import PropertyView from "./components/PropertyView";
import ResultsSection from "./components/ResultsSection";
import WhatWeAreSection from "./components/WhatWeAreSection";
import homeContent from "./data/homeContent.json";

function HomePage() {
  return (
    <>
      {/* Main Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Lead Generation Section */}
      <LeadGenSection />

      {/* What We Are Section */}
      <WhatWeAreSection />

      {/* Process Timeline Section */}
      <ProcessTimelineSection />

      {/* Results From Real Properties Section */}
      <ResultsSection />

      {/* Professional Services Section */}
      <ProfessionalServicesSection />

      {/* Our Presence Section */}
      <OurPresenceSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Journey Banner */}
      <JourneyBanner />

      {/* Media Section */}
      <MediaSection />

      {/* FAQ Section */}
      <FAQSection faqs={homeContent.faqs} cityName="Norge" />

      {/* Footer */}
      <Footer />
    </>
  );
}

function App() {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/owner-portal" element={<OwnerPortalDashboard />} />
          <Route path="/owner-portal/property" element={<PropertyView />} />
          <Route
            path="/owner-portal/documentation"
            element={<PropertyDocumentation />}
          />
          <Route path="/investors" element={<InvestorPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Earnings explainer — this URL was indexed before the rewrite
              and still ranks, so it keeps its path. */}
          <Route path="/data" element={<DataPage />} />

          {/* National rules explainer — the query digihome owns today */}
          <Route path="/korttidsutleie-regler" element={<RulesPage />} />

          {/* Press coverage */}
          <Route path="/nyheter" element={<NewsIndexPage />} />
          <Route path="/nyheter/:slug" element={<NewsArticlePage />} />

          {/* City-specific landing pages */}
          <Route path="/korttidsutleie-i-oslo" element={<CityPage />} />
          <Route path="/korttidsutleie-i-bergen" element={<CityPage />} />
          <Route path="/korttidsutleie-i-stavanger" element={<CityPage />} />
          <Route path="/korttidsutleie-i-haugesund" element={<CityPage />} />
          <Route path="/korttidsutleie-i-tromso" element={<CityPage />} />
          <Route path="/korttidsutleie-i-kristiansand" element={<CityPage />} />
          <Route path="/korttidsutleie-i-trondheim" element={<CityPage />} />
          <Route path="/korttidsutleie-i/:city" element={<CityPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
