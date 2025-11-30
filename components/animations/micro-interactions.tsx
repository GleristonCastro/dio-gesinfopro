"use client";

import { motion, MotionProps } from "framer-motion";
import { ReactNode, forwardRef } from "react";

interface AnimatedCardProps extends MotionProps {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
  tapScale?: number;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    { children, className, hoverScale = 1.02, tapScale = 0.98, ...props },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: hoverScale }}
        whileTap={{ scale: tapScale }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

interface AnimatedButtonProps extends MotionProps {
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
}

export const AnimatedButton = forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(({ children, className, isLoading, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
      disabled={isLoading}
      {...props}
    >
      <motion.span
        animate={isLoading ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
});

AnimatedButton.displayName = "AnimatedButton";

interface FloatingProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  yOffset?: number;
}

export function Floating({
  children,
  className,
  duration = 3,
  yOffset = 10,
}: FloatingProps) {
  return (
    <motion.div
      animate={{
        y: [0, -yOffset, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface PulseProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  scale?: number;
}

export function Pulse({
  children,
  className,
  duration = 2,
  scale = 1.05,
}: PulseProps) {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ShakeProps {
  children: ReactNode;
  className?: string;
  trigger?: boolean;
}

export function Shake({ children, className, trigger = false }: ShakeProps) {
  return (
    <motion.div
      animate={
        trigger
          ? {
              x: [0, -10, 10, -10, 10, 0],
            }
          : {}
      }
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RotateProps {
  children: ReactNode;
  className?: string;
  isRotating?: boolean;
}

export function Rotate({
  children,
  className,
  isRotating = false,
}: RotateProps) {
  return (
    <motion.div
      animate={isRotating ? { rotate: 360 } : { rotate: 0 }}
      transition={{
        duration: 1,
        repeat: isRotating ? Infinity : 0,
        ease: "linear",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  liftAmount?: number;
}

export function HoverLift({
  children,
  className,
  liftAmount = -5,
}: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: liftAmount }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
