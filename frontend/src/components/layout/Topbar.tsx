export function Topbar() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-civic-line bg-civic-panel/70 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-civic-muted">CivicEye AI</p>
        <h2 className="text-xl font-semibold text-civic-text">Citizen grievance intelligence platform</h2>
      </div>
      <div className="rounded-full border border-civic-accent/30 bg-civic-accent/10 px-4 py-2 text-sm text-civic-text">
        AI provider switches via backend env
      </div>
    </header>
  );
}
