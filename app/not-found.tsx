import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        {/* Code */}
        <p className="text-[96px] font-black leading-none text-slate-100 select-none tracking-tight">
          404
        </p>

        <h1 className="mt-6 text-[20px] font-bold text-slate-800">Page not found</h1>
        <p className="mt-2 text-[13px] text-slate-500 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link href="/"
          className="mt-6 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#007BFF] hover:bg-[#0069d9] text-white text-[13px] font-semibold transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
