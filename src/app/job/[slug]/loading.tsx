export default function JobLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
        <div className="h-10 w-2/3 animate-pulse rounded-xl bg-white/10" />
        <div className="mt-4 h-6 w-1/3 animate-pulse rounded-lg bg-white/10" />
        <div className="mt-8 h-24 animate-pulse rounded-2xl bg-white/10" />
      </section>
    </main>
  );
}
