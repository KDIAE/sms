import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <>
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        {/* Code */}
        <p className="text-[96px] font-black leading-none text-slate-100 select-none tracking-tight">
          403
        </p>

        <h1 className="mt-6 text-[20px] font-bold text-slate-800">Access denied</h1>
        <p className="mt-2 text-[13px] text-slate-500 leading-relaxed">
          You don't have permission to view this page. Contact your administrator if you believe this is a mistake.
        </p>

        <Link href="/"
          className="mt-6 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#007BFF] hover:bg-[#0069d9] text-white text-[13px] font-semibold transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </>
  );
}
