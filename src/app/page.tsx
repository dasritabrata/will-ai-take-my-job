import type { Metadata } from "next";

import HomeSearch from "@/components/HomeSearch";

export const metadata: Metadata = {
  title: "Will AI Take My Job?",
  description:
    "Search any profession and get an AI automation risk score with reasoning, time horizon, and future-proof skills.",
  openGraph: {
    title: "Will AI Take My Job?",
    description:
      "Search any profession and get an AI automation risk score with reasoning, time horizon, and future-proof skills.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-20 sm:px-10">
      <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-16 h-96 w-96 rounded-full bg-rose-400/20 blur-3xl" />

      <section className="relative mx-auto flex min-h-[75vh] max-w-5xl flex-col items-center justify-center gap-8">
        <p className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
          Career Intelligence
        </p>
        <h1 className="text-center text-4xl font-extrabold leading-tight text-white sm:text-6xl">
          Will AI Take My Job?
        </h1>
        <p className="max-w-2xl text-center text-base text-slate-300 sm:text-lg">
          Search a profession and get an instant risk analysis with automation likelihood, time horizon, and skills
          to stay ahead.
        </p>
        <HomeSearch />
      </section>
    </main>
  );
}
