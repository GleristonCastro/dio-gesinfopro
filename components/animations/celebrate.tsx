"use client";

import { motion } from "framer-motion";
import { Sparkles, PartyPopper } from "lucide-react";
import { useEffect, useState } from "react";

interface CelebrateProps {
  trigger: boolean;
  message?: string;
}

export function Celebrate({
  trigger,
  message = "🎉 Parabéns!",
}: CelebrateProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -100 }}
      className="fixed bottom-8 right-8 z-50 pointer-events-none"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 0.5,
          repeat: 3,
          ease: "easeInOut",
        }}
        className="bg-linear-to-br from-yellow-400 via-orange-500 to-pink-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
      >
        <PartyPopper className="h-8 w-8" />
        <span className="font-bold text-xl">{message}</span>
        <Sparkles className="h-8 w-8" />
      </motion.div>

      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: Math.random() * 400 - 200,
              y: Math.random() * -400 - 200,
              opacity: 0,
              scale: 0,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 2,
              delay: i * 0.05,
              ease: "easeOut",
            }}
            className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
            style={{
              backgroundColor: [
                "#FFD700",
                "#FF6B9D",
                "#C44CF0",
                "#00D4FF",
                "#00FF88",
              ][i % 5],
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

interface ConfettiExplosionProps {
  x: number;
  y: number;
  colors?: string[];
}

export function ConfettiExplosion({
  x,
  y,
  colors = ["#FFD700", "#FF6B9D", "#C44CF0", "#00D4FF", "#00FF88"],
}: ConfettiExplosionProps) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: Math.cos((i * Math.PI * 2) / 30) * (100 + Math.random() * 100),
            y:
              Math.sin((i * Math.PI * 2) / 30) * (100 + Math.random() * 100) -
              100,
            opacity: 0,
            scale: 0,
            rotate: Math.random() * 720,
          }}
          transition={{
            duration: 1.5 + Math.random(),
            ease: "easeOut",
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
          }}
        />
      ))}
    </div>
  );
}

interface SparkleProps {
  className?: string;
}

export function Sparkle({ className }: SparkleProps) {
  return (
    <motion.div
      animate={{
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      <Sparkles className="h-4 w-4 text-yellow-400" />
    </motion.div>
  );
}
