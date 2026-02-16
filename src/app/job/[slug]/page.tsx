import type { Metadata } from "next";
import Link from "next/link";

import JobAnalysisCard from "@/components/JobAnalysisCard";
import { getOrCreateJob } from "@/lib/jobService";

export const dynamic = "force-dynamic";

type JobPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const job = await getOrCreateJob(slug);
    const title = `Will AI Take My Job? | ${job.jobTitle}`;
    const description = `${job.jobTitle} has a ${job.risk_score}/100 AI risk score (${job.risk_level}).`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
      },
    };
  } catch {
    return {
      title: "Will AI Take My Job? | Job Analysis",
      description: "AI risk analysis for modern professions.",
    };
  }
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params;
  const result = await getOrCreateJob(slug)
    .then((job) => ({ job, error: null as string | null }))
    .catch((error: unknown) => ({
      job: null,
      error: error instanceof Error ? error.message : "Unable to load analysis",
    }));

  if (result.error || !result.job) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <section className="w-full max-w-xl rounded-3xl border border-rose-200/20 bg-rose-950/20 p-8 backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-white">Analysis unavailable</h1>
          <p className="mt-3 text-slate-300">{result.error}</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-900 transition hover:bg-cyan-300"
          >
            Try another role
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-12 sm:px-10">
      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6">
        <Link
          href="/"
          className="inline-flex w-fit rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
        >
          Back to Search
        </Link>

        <JobAnalysisCard job={result.job} />
      </div>
    </main>
  );
}
