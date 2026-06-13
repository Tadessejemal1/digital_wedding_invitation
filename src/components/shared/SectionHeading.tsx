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
      className={`mb-12 text-center ${className}`}
    >
      <div className="decorative-line mb-6" />
      <h2 className="font-display text-4xl font-light tracking-wide text-wine md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 font-serif text-lg italic text-gray-600">{subtitle}</p>
      )}
      <div className="decorative-line mt-6" />
    </motion.div>
  );
}
