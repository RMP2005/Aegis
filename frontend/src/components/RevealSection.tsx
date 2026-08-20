"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

interface RevealSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

const directionOffset = {
  up: { x: 0, y: 30 },
  down: { x: 0, y: -30 },
  left: { x: 30, y: 0 },
  right: { x: -30, y: 0 },
};

export default function RevealSection({
  children,
  className = "",
  id,
  delay = 0,
  direction = "up",
  distance = 30,
}: RevealSectionProps) {
  const offset = directionOffset[direction];
  const scale = distance / 30;

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x * (distance / 30),
      y: offset.y * (distance / 30),
      scale: 1 + 0.005 * scale,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
    },
  };

  return (
    <motion.div
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-80px", amount: 0.15 }}
      variants={variants}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
