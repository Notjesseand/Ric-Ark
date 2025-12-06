

"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Sidebar from "./home/sidebar";
import { auth } from "@/lib/firebase";
import { usePathname } from "next/navigation";

interface NavProps {
  hideAuthButtons?: boolean;
}

const Nav1 = ({ hideAuthButtons = false }: NavProps) => {
  const [showNavbar, setShowNavbar] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const isLicencesPage = pathname === "/licences";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 125) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "How it works", id: "how-it-works" },
    { label: "Our Team", id: "team" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <div className="text-white flex font-montserrat justify-between px-5 pr-5 sm:px-10 pt-3 sm:pt-4 items-center">
      <Link href="/">
        <img src="/logo.png" alt="" className="h-14 sm:h-20 z-50 relative" />
      </Link>

      <div>
        {/* Desktop nav */}
        <div className="md:flex gap-x-6 py-5 items-center hidden text-sm">
          {navLinks.map((link) => {
            if (link.label === "Home") {
              return (
                <Link
                  key={link.id}
                  href="/"
                  className="hover:text-gray-400 transition-colors"
                >
                  {link.label}
                </Link>
              );
            }

            return isHomepage ? (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="hover:text-gray-400 transition-colors"
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.id}
                href={`/#${link.id}`}
                className="hover:text-gray-400 transition-colors"
              >
                {link.label}
              </Link>
            );
          })}

          {!isLicencesPage && (
            <Link
              href="/licences"
              className="hover:text-gray-400 transition-colors"
            >
              Licences
            </Link>
          )}

          {!hideAuthButtons && !isAuthenticated && (
            <>
              <Link
                href="/auth/login"
                className="hover:text-gray-400 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth"
                className="border flex px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="border px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Mobile nav */}
        <div className="flex gap-x-6 py-7 items-center md:hidden">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default Nav1;
