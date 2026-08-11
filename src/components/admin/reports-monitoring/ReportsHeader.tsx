interface ReportsHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
}

export default function ReportsHeader({ onRefresh, onExport }: ReportsHeaderProps) {
  return (
    <header className="bg-white border border-light-border p-6 rounded-3xl shadow-apple-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative select-none text-left">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider">
          System Overview &amp; Analytics
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif leading-tight">
          Platform Reports &amp; Monitoring
        </h1>
        <p className="text-xs text-stone-500 font-medium">
          Monitor platform activity and operational performance.
        </p>
      </div>

      <div className="flex gap-2 text-xs font-bold text-stone-705">
        <button
          onClick={onRefresh}
          className="px-3.5 py-2 border border-stone-200 bg-white hover:bg-stone-50 rounded-xl transition flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald"
          aria-label="Refresh operational statistics metrics"
        >
          🔄 Refresh
        </button>
        <button
          onClick={onExport}
          className="px-3.5 py-2 border border-stone-200 bg-white hover:bg-stone-50 rounded-xl transition flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald"
          aria-label="Export platform operational summary report as CSV"
        >
          📤 Export Report
        </button>
      </div>
    </header>
  );
}
