"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({ title, subtitle, className = "" }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`mb-8 text-center sm:mb-12 ${className}`}
    >
      <div className="decorative-line mb-4 sm:mb-6" />
      <h2 className="font-display text-2xl font-light tracking-wide text-wine sm:text-3xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 px-1 font-serif text-base italic text-gray-600 sm:mt-4 sm:text-lg">{subtitle}</p>
      )}
      <div className="decorative-line mt-6" />
    </motion.div>
  );
}
