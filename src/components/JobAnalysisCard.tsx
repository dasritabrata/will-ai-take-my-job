"use client";

import { motion } from "framer-motion";

import type { JobAnalysis } from "@/types/job";
import RiskGauge from "@/components/RiskGauge";

type JobAnalysisCardProps = {
  job: JobAnalysis;
};

function badgeClass(level: JobAnalysis["risk_level"]): string {
  if (level === "High") return "bg-rose-400/20 text-rose-200 border-rose-300/40";
  if (level === "Medium") return "bg-amber-400/20 text-amber-100 border-amber-300/40";
  return "bg-emerald-400/20 text-emerald-100 border-emerald-300/40";
}

export default function JobAnalysisCard({ job }: JobAnalysisCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur-2xl sm:p-10"
    >
      <div className="grid items-start gap-10 lg:grid-cols-[auto,1fr]">
        <div className="mx-auto">
          <RiskGauge score={job.risk_score} />
        </div>

        <div className="space-y-6">
          <div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="text-3xl font-bold text-white sm:text-5xl"
            >
              {job.jobTitle}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="mt-4 flex flex-wrap items-center gap-3"
            >
              <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${badgeClass(job.risk_level)}`}>
                {job.risk_level} Risk
              </span>
              <span className="rounded-full border border-cyan-200/30 bg-cyan-300/15 px-3 py-1 text-sm text-cyan-100">
                {job.industry}
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-sm text-slate-300">
              <span>Automation likelihood</span>
              <span>{job.automation_percentage}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${job.automation_percentage}%` }}
                transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-amber-300 to-rose-400"
              />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="text-slate-200"
          >
            {job.reason}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="grid gap-6 sm:grid-cols-2"
          >
            <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Time Horizon</p>
              <p className="mt-2 text-lg font-semibold text-white">{job.time_horizon}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Future Skills</p>
              <ul className="mt-2 space-y-2 text-slate-200">
                {job.future_skills.map((skill) => (
                  <li key={skill}>• {skill}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
