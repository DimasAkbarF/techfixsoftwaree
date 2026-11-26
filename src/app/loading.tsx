export default function PublicLoading() {
  return (
    <div
      className="page-canvas min-h-screen animate-pulse"
      aria-busy="true"
      aria-label="Memuat halaman"
    >
      <div className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80" />
      <div className="page-header">
        <div className="mx-auto max-w-[1200px] space-y-3 px-4 py-10 lg:px-8">
          <div className="h-8 w-72 max-w-[80%] rounded-[var(--radius)] bg-[var(--color-border)]" />
          <div className="h-4 w-[480px] max-w-full rounded-[var(--radius)] bg-[var(--color-border)]/75" />
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] space-y-4 px-4 py-10 lg:px-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/85"
          />
        ))}
      </div>
    </div>
  );
}
