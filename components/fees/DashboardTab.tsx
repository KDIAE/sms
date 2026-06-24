"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { SmsFeeDashboard } from "@/lib/api";
import { StatCard } from "./shared";

const revenueConfig: ChartConfig = {
  expected:  { label: "Target",    color: "#e2e8f0" },
  collected: { label: "Collected", color: "#007BFF" },
};

export function DashboardTab({ dash, loading, onRetry }: {
  dash: SmsFeeDashboard | null;
  loading: boolean;
  onRetry: () => void;
}) {
  if (!loading && !dash) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
        <p className="text-[13px]">Failed to load data.</p>
        <Button size="sm" onClick={onRetry}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-none border-slate-200 py-0">
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-3 w-36" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard label="Total Collected (YTD)"  value={`₹${(dash!.total_collected / 100000).toFixed(2)}L`} accent />
            <StatCard label="Admission Collected"    value={`₹${(dash!.admission_collected / 1000).toFixed(1)}K`} />
            <StatCard label="Tuition Collected"      value={`₹${(dash!.tuition_collected / 1000).toFixed(1)}K`} sub={`Session ${dash!.session}`} />
            <StatCard label="Overdue Accounts"       value={dash!.overdue_count} sub="Students with pending dues" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart card */}
        <Card className="shadow-none border-slate-200 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px] font-semibold">
              {loading ? <Skeleton className="h-4 w-56" /> : `Monthly Fee Collection ${dash!.session}`}
            </CardTitle>
            <CardDescription className="text-[12px]">
              {loading ? <Skeleton className="h-3 w-32 mt-1" /> : "Tuition fees combined"}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {loading ? (
              <div className="h-[240px] flex items-end gap-2 px-2">
                {[60, 45, 75, 50, 80, 40, 65, 55, 70, 45, 60, 50].map((h, i) => (
                  <Skeleton key={i} className="flex-1 rounded-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            ) : (
              <>
                {dash!.total_collected === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/60 backdrop-blur-[2px]">
                    <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-[13px] text-slate-400 font-medium">No collection data yet</p>
                    <p className="text-[11px] text-slate-300 mt-1">Record payments to see charts</p>
                  </div>
                )}
                <ChartContainer config={revenueConfig} className="h-[240px] w-full">
                  <BarChart data={dash!.monthly_chart ?? []} margin={{ left: 0, right: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={8} />
                    <YAxis tickFormatter={v => `₹${Number(v) / 1000}K`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={48} />
                    <ChartTooltip content={<ChartTooltipContent formatter={v => [`₹${Number(v).toLocaleString()}`]} />} />
                    <Bar dataKey="expected"  fill="var(--color-expected)"  radius={[3, 3, 0, 0]} />
                    <Bar dataKey="collected" fill="var(--color-collected)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </>
            )}
          </CardContent>
        </Card>

        {/* Breakdown card */}
        <Card className="shadow-none border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px] font-semibold">
              {loading ? <Skeleton className="h-4 w-40" /> : "Collection Breakdown"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 relative">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))
            ) : (
              <>
                {dash!.total_collected === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/60 backdrop-blur-[2px]">
                    <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[12px] text-slate-400 font-medium">No data</p>
                  </div>
                )}
                {[
                  { label: "Admissions",      data: dash!.breakdown_admission, color: "bg-blue-500" },
                  { label: "Monthly Tuition", data: dash!.breakdown_tuition,   color: "bg-emerald-500" },
                  { label: "Books",           data: dash!.breakdown_books,     color: "bg-violet-500" },
                  { label: "Uniforms",        data: dash!.breakdown_uniforms,  color: "bg-amber-500" },
                ].map(item => {
                  const pct = item.data.target > 0 ? Math.round((item.data.collected / item.data.target) * 100) : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[12px] text-slate-600 font-medium">{item.label}</span>
                        <span className="text-[12px] text-slate-500">
                          ₹{(item.data.collected / 1000).toFixed(1)}K <span className="text-slate-400">/ ₹{(item.data.target / 1000).toFixed(1)}K</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
