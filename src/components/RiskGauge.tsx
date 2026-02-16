"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

type RiskGaugeProps = {
  score: number;
};

const CIRCLE_RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function RiskGauge({ score }: RiskGaugeProps) {
  const scoreValue = useMotionValue(0);
  const animatedScore = useSpring(scoreValue, { stiffness: 70, damping: 20 });

  useEffect(() => {
    scoreValue.set(score);
  }, [score, scoreValue]);

  const progress = useTransform(animatedScore, (value) => value / 100);
  const strokeDashoffset = useTransform(progress, (value) => CIRCUMFERENCE * (1 - value));
  const shownScore = useTransform(animatedScore, (value) => Math.round(value));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="relative h-56 w-56"
    >
      <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90">
        <circle cx="110" cy="110" r={CIRCLE_RADIUS} stroke="rgba(255,255,255,0.15)" strokeWidth="16" fill="none" />
        <motion.circle
          cx="110"
          cy="110"
          r={CIRCLE_RADIUS}
          stroke="url(#riskGradient)"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset }}
        />
        <defs>
          <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.p className="text-5xl font-bold text-white">{shownScore}</motion.p>
          <p className="text-sm tracking-wider text-slate-300">Risk Score</p>
        </div>
      </div>
    </motion.div>
  );
}
