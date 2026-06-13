"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

const navKeys = ["home", "story", "program", "gallery", "location", "rsvp", "checkIn", "guestbook" /* "gifts" */] as const;

export function Navigation() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-white/95 shadow-md backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <a href="#home" className={`font-display text-xl ${scrolled ? "text-wine" : "text-white"}`}>
            T & H
          </a>

          <div className="hidden items-center gap-6 lg:flex">
            {navKeys.map((key) => (
              <a
                key={key}
                href={`#${key === "home" ? "home" : key}`}
                className={`text-sm uppercase tracking-wider transition-colors hover:text-gold ${
                  scrolled ? "text-wine" : "text-white/90"
                }`}
              >
                {t(key)}
              </a>
            ))}
            <LanguageSwitcher />
          </div>

          <button
            className={`lg:hidden ${scrolled ? "text-wine" : "text-white"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-50 flex flex-col bg-wine pt-20 lg:hidden"
          >
            <div className="flex flex-col gap-6 px-8">
              {navKeys.map((key) => (
                <a
                  key={key}
                  href={`#${key === "home" ? "home" : key}`}
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-2xl text-white hover:text-gold-light"
                >
                  {t(key)}
                </a>
              ))}
              <LanguageSwitcher />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
