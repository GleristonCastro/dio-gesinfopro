"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: AnimatedCounterProps) {
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (current) =>
    current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
}

interface AnimatedCurrencyProps {
  value: number;
  duration?: number;
  className?: string;
  locale?: string;
}

export function AnimatedCurrency({
  value,
  duration = 1,
  className = "",
  locale = "pt-BR",
}: AnimatedCurrencyProps) {
  const spring = useSpring(0, { duration: duration * 1000 });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className={className}>
      R${" "}
      <motion.span>
        {useTransform(spring, (current) =>
          current.toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        )}
      </motion.span>
    </motion.span>
  );
}

interface AnimatedPercentageProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedPercentage({
  value,
  duration = 1,
  className = "",
}: AnimatedPercentageProps) {
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (current) => `${current.toFixed(1)}%`);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface CountUpProps {
  from: number;
  to: number;
  duration?: number;
  onComplete?: () => void;
}

export function useCountUp({
  from,
  to,
  duration = 2,
  onComplete,
}: CountUpProps) {
  const spring = useSpring(from, {
    duration: duration * 1000,
    bounce: 0,
  });

  useEffect(() => {
    spring.set(to);

    const unsubscribe = spring.on("change", (latest) => {
      if (Math.abs(latest - to) < 0.01 && onComplete) {
        onComplete();
      }
    });

    return () => unsubscribe();
  }, [to, spring, onComplete]);

  return spring;
}
