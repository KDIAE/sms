"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  attendanceApi,
  type AttendanceTrendPoint,
  type ClassAttendanceItem,
  type DefaulterItem,
  type DailyRecordItem,
} from "@/lib/api";

const days = ["mon", "tue", "wed", "thu", "fri"] as const;
const dayLabels: Record<typeof days[number], string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri",
};

const trendConfig: ChartConfig = {
  overall: { label: "Overall", color: "#007BFF" },
  class3:  { label: "Class 3", color: "#FFCA2B" },
  class5:  { label: "Class 5", color: "#20c997" },
  class6:  { label: "Class 6", color: "#6f42c1" },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [monthlyTrend, setMonthlyTrend] = useState<AttendanceTrendPoint[]>([]);
  const [classAttendance, setClassAttendance] = useState<ClassAttendanceItem[]>([]);
  const [defaulters, setDefaulters] = useState<DefaulterItem[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecordItem[]>([]);
  const [overallAvg, setOverallAvg] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPresent, setTotalPresent] = useState(0);
  const [belowThreshold, setBelowThreshold] = useState(0);

  useEffect(() => {
    setLoading(true);
    attendanceApi.dashboard(75, 50)
      .then((res) => {
        setMonthlyTrend(res.monthly_trend);
        setClassAttendance(res.class_attendance);
        setDefaulters(res.defaulters);
        setDailyRecords(res.daily_records);
        setOverallAvg(res.stats.overall_attendance);
        setTotalStudents(res.stats.total_students);
        setTotalPresent(res.stats.present_today);
        setBelowThreshold(res.stats.below_threshold);
      })
      .catch(() => {
        setMonthlyTrend([]);
        setClassAttendance([]);
        setDefaulters([]);
        setDailyRecords([]);
        setOverallAvg(0);
        setTotalStudents(0);
        setTotalPresent(0);
        setBelowThreshold(0);
      })
      .finally(() => setLoading(false));
  }, []);

  const sortedDefaulters = useMemo(() => [...defaulters].sort((a, b) => a.attendance - b.attendance), [defaulters]);

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Overall Attendance", value: `${overallAvg}%`    },
            { label: "Total Students",     value: totalStudents        },
            { label: "Present Today",      value: totalPresent         },
            { label: "Below 75%",          value: belowThreshold       },
          ].map((st) => (
            <Card key={st.label} className="shadow-none border-slate-200">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-slate-900">{st.value}</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{st.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-slate-100 h-8">
            <TabsTrigger value="overview"   className="text-[12px] h-6">Overview</TabsTrigger>
            <TabsTrigger value="daily"      className="text-[12px] h-6">Daily Records</TabsTrigger>
            <TabsTrigger value="defaulters" className="text-[12px] h-6">Defaulters</TabsTrigger>
          </TabsList>
          {/* Overview tab */}
          <TabsContent value="overview" className="mt-4 flex flex-col gap-4">
            {/* Trend chart */}
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] font-semibold">Monthly Attendance Trend</CardTitle>
                <CardDescription className="text-[12px]">School-wide vs individual classes</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-[220px] w-full" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                ) : monthlyTrend.length === 0 ? (
                  <div className="h-[220px] w-full flex items-center justify-center text-[12px] text-slate-500">No trend data available</div>
                ) : (
                  <ChartContainer config={trendConfig} className="h-[220px] w-full">
                    <LineChart data={monthlyTrend} margin={{ left: 0, right: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={8} />
                      <YAxis domain={[70, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
                      <ChartTooltip content={<ChartTooltipContent formatter={(v) => [`${v}%`]} />} />
                      <Line type="monotone" dataKey="overall" stroke="var(--color-overall)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="class3" stroke="var(--color-class3)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                      <Line type="monotone" dataKey="class5" stroke="var(--color-class5)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                      <Line type="monotone" dataKey="class6" stroke="var(--color-class6)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                    </LineChart>
                  </ChartContainer>
                )}
                {/* Legend */}
                <div className="flex items-center gap-5 mt-3 px-1">
                  {Object.entries(trendConfig).map(([key, cfg]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="w-3 h-[2px] rounded-full inline-block" style={{ background: cfg.color }} />
                      <span className="text-[11px] text-slate-500">{cfg.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Class breakdown bars */}
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] font-semibold">Attendance by Class (Today)</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={`class-skel-${i}`} className="h-6 w-full" />)}
                  </div>
                ) : classAttendance.length === 0 ? (
                  <div className="text-[12px] text-slate-500">No class attendance data available</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {classAttendance.map((c) => (
                      <div key={c.class_name} className="flex items-center gap-4">
                        <span className="w-16 text-[12px] font-medium text-slate-700 shrink-0">{c.class_name}</span>
                        <Progress value={c.avg} className="h-2 flex-1" />
                        <span className={`w-28 text-right text-[12px] font-semibold shrink-0 ${c.avg < 85 ? "text-amber-600" : "text-slate-700"}`}>
                          {c.avg}% ({c.present}/{c.total})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Daily Records tab */}
          <TabsContent value="daily" className="mt-4">
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] font-semibold">This Week&apos;s Attendance</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={`daily-skel-${i}`} className="h-10 w-full" />)}
                  </div>
                ) : dailyRecords.length === 0 ? (
                  <div className="p-6 text-[12px] text-slate-500">No daily attendance records available</div>
                ) : (
                  <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-[11px] font-semibold uppercase text-slate-500 pl-6">Student</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase text-slate-500">Class</TableHead>
                      {days.map((d) => (
                        <TableHead key={d} className="text-[11px] font-semibold uppercase text-slate-500 text-center">
                          {dayLabels[d]}
                        </TableHead>
                      ))}
                      <TableHead className="text-[11px] font-semibold uppercase text-slate-500 pr-6 text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyRecords.map((r) => {
                      const count = days.filter((d) => r[d]).length;
                      return (
                        <TableRow key={r.student} className="hover:bg-slate-50 border-slate-100">
                          <TableCell className="text-[13px] font-medium text-slate-900 pl-6">{r.student}</TableCell>
                          <TableCell className="text-[13px] text-slate-600">{r.class_name}</TableCell>
                          {days.map((d) => (
                            <TableCell key={d} className="text-center">
                              <span className={`inline-flex w-5 h-5 rounded-full items-center justify-center text-[10px] font-bold ${r[d] ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                                {r[d] ? "P" : "A"}
                              </span>
                            </TableCell>
                          ))}
                          <TableCell className={`text-[13px] font-semibold text-center pr-6 ${count < 3 ? "text-red-600" : "text-slate-700"}`}>
                            {count}/5
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Defaulters tab */}
          <TabsContent value="defaulters" className="mt-4">
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] font-semibold">Attendance Defaulters</CardTitle>
                <CardDescription className="text-[12px]">Students with attendance below 75%</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={`def-skel-${i}`} className="h-10 w-full" />)}
                  </div>
                ) : sortedDefaulters.length === 0 ? (
                  <div className="p-6 text-[12px] text-slate-500">No defaulters found</div>
                ) : (
                  <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-[11px] font-semibold uppercase text-slate-500 pl-6">Student</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase text-slate-500">Class</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase text-slate-500 pr-6">Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDefaulters.map((d) => (
                      <TableRow key={d.name} className="hover:bg-slate-50 border-slate-100">
                        <TableCell className="text-[13px] font-medium text-slate-900 pl-6">{d.name}</TableCell>
                        <TableCell className="text-[13px] text-slate-600">{d.class_name}</TableCell>
                        <TableCell className="pr-6">
                          <div className="flex items-center gap-3">
                            <Progress value={d.attendance} className="h-1.5 w-28" />
                            <span className="text-[12px] font-semibold text-red-600">{d.attendance}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
