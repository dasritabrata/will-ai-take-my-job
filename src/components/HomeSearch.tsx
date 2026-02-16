"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Suggestion = {
  jobId: string;
  jobTitle: string;
  industry: string;
};

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const normalizedQuery = useMemo(() => slugify(query), [query]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const data = (await response.json()) as Suggestion[];
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  const submit = (rawValue: string) => {
    const slug = slugify(rawValue);
    if (!slug) return;
    router.push(`/job/${slug}`);
  };

  return (
    <div className="w-full max-w-2xl">
      <motion.form
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onSubmit={(event) => {
          event.preventDefault();
          submit(query);
        }}
        className="relative"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 120)}
          placeholder="Search a job title (e.g. Product Manager)"
          className="w-full rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-lg text-white outline-none backdrop-blur-xl transition focus:border-cyan-300/70"
          aria-label="Search job"
        />
        <button
          type="submit"
          disabled={!normalizedQuery}
          className="absolute right-2 top-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
        >
          Analyze
        </button>

        <AnimatePresence>
          {isFocused && (suggestions.length > 0 || isLoading) ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute z-20 mt-3 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl"
            >
              {isLoading ? (
                <div className="px-4 py-3 text-sm text-slate-300">Searching...</div>
              ) : (
                suggestions.map((item) => (
                  <button
                    key={item.jobId}
                    type="button"
                    onClick={() => submit(item.jobId)}
                    className="flex w-full items-center justify-between border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5 last:border-b-0"
                  >
                    <span className="font-medium text-white">{item.jobTitle}</span>
                    <span className="text-xs text-slate-400">{item.industry}</span>
                  </button>
                ))
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.form>
    </div>
  );
}
