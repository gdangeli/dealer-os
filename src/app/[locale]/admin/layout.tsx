import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-2xl">👑</span>
              <span className="text-xl font-bold">DealerOS Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="text-slate-300 hover:text-white transition-colors"
            >
              ← Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      {/* Content */}
      {children}
    </div>
  );
}
