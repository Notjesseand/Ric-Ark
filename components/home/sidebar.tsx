"use client";
import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HiMiniBars2 } from "react-icons/hi2";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const isLicencesPage = pathname === "/licences";

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
    <div className="text-sm">
      <Sheet>
        <SheetTrigger>
          <HiMiniBars2 className="md:hidden text-4xl text-white" />
        </SheetTrigger>
        <SheetContent className="bg-[#0E1112] text-white border-[#0E1112] text-sm">
          <div className="flex flex-col items-center gap-y-3 pt-6 font-montserrat">
            {navLinks.map((link) => (
              <SheetClose key={link.id} asChild>
                {isHomepage ? (
                  <button
                    onClick={() => scrollTo(link.id)}
                    className="hover:text-gray-400 transition-colors duration-200 w-full py-2"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    href="/" // Changed from `/#${link.id}` to `/`
                    className="hover:text-gray-400 transition-colors duration-200 w-full py-2 text-center"
                  >
                    {link.label}
                  </Link>
                )}
              </SheetClose>
            ))}
            {!isLicencesPage && (
              <SheetClose asChild>
                <Link
                  href="/licences"
                  className="hover:text-gray-400 transition-colors duration-200 w-full py-2 text-center"
                >
                  Licences
                </Link>
              </SheetClose>
            )}
            {isAuthenticated && (
              <SheetClose asChild>
                <Link
                  href="/dashboard"
                  className="hover:text-gray-400 transition-colors duration-200 w-full py-2 text-center"
                >
                  Dashboard
                </Link>
              </SheetClose>
            )}
            {!isAuthenticated && (
              <>
                <SheetClose asChild>
                  <Link
                    href="/contact" // Adjust if needed
                    className="hover:text-gray-400 transition-colors duration-200 w-full py-2 text-center"
                  >
                    Contact us
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/auth/login"
                    className="hover:text-gray-400 transition-colors duration-200 w-full py-2 text-center"
                  >
                    Login
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/auth"
                    className="hover:text-gray-400 transition-colors duration-200 w-full py-2 text-center"
                  >
                    Sign up
                  </Link>
                </SheetClose>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Sidebar;
