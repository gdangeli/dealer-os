"use client";

export function DashboardPreview() {
  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-indigo-400/20 rounded-3xl blur-3xl" />
      
      {/* Browser Window */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 0 60px rgba(99, 102, 241, 0.15)" }}>
        {/* Browser Header */}
        <div className="bg-slate-100 px-4 py-3 flex items-center gap-2 border-b border-slate-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-slate-400 ml-2">
            dealer-os.ch/dashboard
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 bg-slate-50">
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
              <div className="text-xs sm:text-sm text-slate-500 mb-1">Fahrzeuge</div>
              <div className="text-lg sm:text-2xl font-bold text-slate-900">47</div>
              <div className="text-[10px] sm:text-xs text-emerald-600 mt-1">↗ 12% diesen Monat</div>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
              <div className="text-xs sm:text-sm text-slate-500 mb-1">Offene Leads</div>
              <div className="text-lg sm:text-2xl font-bold text-slate-900">23</div>
              <div className="text-[10px] sm:text-xs text-amber-600 mt-1">5 brauchen Follow-up</div>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
              <div className="text-xs sm:text-sm text-slate-500 mb-1">Umsatz Feb</div>
              <div className="text-lg sm:text-2xl font-bold text-slate-900">187k</div>
              <div className="text-[10px] sm:text-xs text-emerald-600 mt-1">↗ CHF vs. Vormonat</div>
            </div>
          </div>
          
          {/* Latest Leads */}
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-800 text-sm sm:text-base">Neueste Leads</span>
              <span className="text-xs sm:text-sm text-sky-600">Alle anzeigen →</span>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3 p-2 bg-emerald-50 rounded-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 text-xs sm:text-sm">●</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-slate-900 truncate">Hans Müller</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 truncate">BMW X5 • AutoScout24</div>
                </div>
                <span className="text-[10px] sm:text-xs text-emerald-600 font-medium flex-shrink-0">Gerade eben</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-slate-50 rounded-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-slate-600 text-xs sm:text-sm">📞</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-slate-900 truncate">Maria Schneider</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 truncate">VW Golf • Telefon</div>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 flex-shrink-0">vor 2 Std</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
