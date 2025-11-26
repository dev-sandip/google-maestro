export const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="flex items-center gap-3 md:gap-4 p-4 rounded-lg bg-[#121214] border border-white/5">
    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-md bg-${color}-500/10 flex items-center justify-center text-${color}-500 shrink-0`}>
      <Icon size={18} className="md:w-5 md:h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest truncate">{label}</p>
      <p className="text-xl md:text-2xl font-semibold text-white font-display tabular-nums truncate">{value}</p>
    </div>
  </div>
);
