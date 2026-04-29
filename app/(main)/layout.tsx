"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGallery = pathname === "/gallery";

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Navbar />
          <main className={`flex-1 overflow-y-auto min-h-0${isGallery ? "" : " p-6"}`}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
