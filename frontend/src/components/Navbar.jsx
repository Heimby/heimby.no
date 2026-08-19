import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const Navbar = ({ isDark = true, solid = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const opaque = solid || isScrolled;

  const navLinks = [];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          opaque
            ? "bg-white/95 backdrop-blur-sm border-b border-gray-200"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[56px] sm:h-[60px] lg:h-[52px]">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <a href="/" className="flex items-center h-full py-3">
              <img
                src={opaque ? "/heimby-logo-black.svg" : "/heimby-logo.svg"}
                alt="Heimby Logo"
                className="h-full w-auto transition-all duration-300 hover:scale-110"
                style={{ transform: "scale(0.7)" }}
              />
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 transition-colors ${
                opaque ? "text-gray-900" : "text-white"
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
