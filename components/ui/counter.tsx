"use client";

import React from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

interface CounterProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  decimal?: string;
  preserveValue?: boolean;
  onEnd?: () => void;
  triggerOnView?: boolean;
}

export function Counter({
  end,
  start = 0,
  duration = 2,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ".",
  decimal = ",",
  preserveValue = true,
  onEnd,
  triggerOnView = true,
}: CounterProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  return (
    <span ref={ref}>
      {triggerOnView && inView ? (
        <CountUp
          end={end}
          start={start}
          duration={duration}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          separator={separator}
          decimal={decimal}
          preserveValue={preserveValue}
          onEnd={onEnd}
        />
      ) : (
        <CountUp
          end={triggerOnView ? 0 : end}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          separator={separator}
          decimal={decimal}
        />
      )}
    </span>
  );
}
