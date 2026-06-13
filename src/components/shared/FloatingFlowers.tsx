"use client";

import { motion } from "framer-motion";

const flowers = ["✿", "❀", "✾", "🌸", "✿"];

export function FloatingFlowers() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {flowers.map((flower, i) => (
        <motion.span
          key={i}
          className="absolute text-gold/20 text-2xl md:text-4xl"
          style={{
            left: `${10 + i * 18}%`,
            top: `${15 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8,
          }}
        >
          {flower}
        </motion.span>
      ))}
    </div>
  );
}
