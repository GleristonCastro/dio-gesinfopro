"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface LayoutTransitionProps {
  children: ReactNode;
}

export function LayoutTransition({ children }: LayoutTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -10 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
