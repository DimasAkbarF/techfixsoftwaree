export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Memuat halaman admin">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="space-y-2">
          <div className="h-7 w-52 rounded-[var(--radius)] bg-[var(--color-border)]" />
          <div className="h-4 w-80 max-w-full rounded-[var(--radius)] bg-[var(--color-border)]/70" />
        </div>
        <div className="h-9 w-32 rounded-[var(--radius)] bg-[var(--color-border)]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <div className="h-3 w-24 rounded bg-[var(--color-border)]" />
            <div className="mt-4 h-7 w-14 rounded bg-[var(--color-border)]" />
          </div>
        ))}
      </div>

      <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 px-4 py-4">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-56 max-w-[70%] rounded bg-[var(--color-border)]" />
              <div className="h-3 w-36 rounded bg-[var(--color-border)]/70" />
            </div>
            <div className="h-6 w-16 rounded bg-[var(--color-border)]/80" />
          </div>
        ))}
      </div>
    </div>
  );
}
