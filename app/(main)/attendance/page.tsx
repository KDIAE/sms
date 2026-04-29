"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

// ── Data ─────────────────────────────────────────────────────────────────────

const MONTHLY_TREND = [
  { month: "Sep", overall: 91, class3: 89, class5: 93, class6: 90 },
  { month: "Oct", overall: 88, class3: 85, class5: 90, class6: 88 },
  { month: "Nov", overall: 93, class3: 91, class5: 95, class6: 92 },
  { month: "Dec", overall: 79, class3: 76, class5: 81, class6: 78 },
  { month: "Jan", overall: 94, class3: 92, class5: 95, class6: 93 },
  { month: "Feb", overall: 96, class3: 94, class5: 97, class6: 95 },
  { month: "Mar", overall: 92, class3: 90, class5: 93, class6: 91 },
  { month: "Apr", overall: 90, class3: 88, class5: 91, class6: 89 },
];

const CLASS_ATTENDANCE = [
  { class: "Nursery", avg: 89, total: 45, present: 40 },
  { class: "Class 1", avg: 93, total: 68, present: 63 },
  { class: "Class 2", avg: 91, total: 72, present: 66 },
  { class: "Class 3", avg: 88, total: 65, present: 57 },
  { class: "Class 4", avg: 87, total: 58, present: 50 },
  { class: "Class 5", avg: 91, total: 54, present: 49 },
  { class: "Class 6", avg: 89, total: 49, present: 44 },
];

const DEFAULTERS = [
  { name: "Rohan Das",        class: "Class 3-C", attendance: 65 },
  { name: "Ritika Sengupta",  class: "Class 6-A", attendance: 67 },
  { name: "Sneha Banerjee",   class: "Class 4-A", attendance: 72 },
  { name: "Prasanta Mondal",  class: "Class 4-B", attendance: 71 },
  { name: "Suman Ghosh",      class: "Class 2-C", attendance: 74 },
];

const DAILY_RECORDS = [
  { student: "Priya Chatterjee", class: "Class 5-A", mon: true,  tue: true,  wed: true,  thu: true,  fri: true  },
  { student: "Arjun Mukherjee",  class: "Class 6-B", mon: true,  tue: false, wed: true,  thu: true,  fri: true  },
  { student: "Sneha Banerjee",   class: "Class 4-A", mon: false, tue: true,  wed: false, thu: true,  fri: false },
  { student: "Rohan Das",        class: "Class 3-C", mon: false, tue: false, wed: true,  thu: false, fri: true  },
  { student: "Tanya Roy",        class: "Class 5-B", mon: true,  tue: true,  wed: true,  thu: false, fri: true  },
];

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

  const overallAvg  = Math.round(CLASS_ATTENDANCE.reduce((a, c) => a + c.avg, 0) / CLASS_ATTENDANCE.length);
  const totalStudents = CLASS_ATTENDANCE.reduce((a, c) => a + c.total, 0);
  const totalPresent  = CLASS_ATTENDANCE.reduce((a, c) => a + c.present, 0);

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Overall Attendance", value: `${overallAvg}%`    },
            { label: "Total Students",     value: totalStudents        },
            { label: "Present Today",      value: totalPresent         },
            { label: "Below 75%",          value: DEFAULTERS.length    },
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
                <ChartContainer config={trendConfig} className="h-[220px] w-full">
                  <LineChart data={MONTHLY_TREND} margin={{ left: 0, right: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={8} />
                    <YAxis domain={[70, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(v) => [`${v}%`]} />} />
                    <Line type="monotone" dataKey="overall" stroke="var(--color-overall)" strokeWidth={2}   dot={false} />
                    <Line type="monotone" dataKey="class3"  stroke="var(--color-class3)"  strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="class5"  stroke="var(--color-class5)"  strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="class6"  stroke="var(--color-class6)"  strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  </LineChart>
                </ChartContainer>
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
                <div className="flex flex-col gap-3">
                  {CLASS_ATTENDANCE.map((c) => (
                    <div key={c.class} className="flex items-center gap-4">
                      <span className="w-16 text-[12px] font-medium text-slate-700 shrink-0">{c.class}</span>
                      <Progress value={c.avg} className="h-2 flex-1" />
                      <span className={`w-28 text-right text-[12px] font-semibold shrink-0 ${c.avg < 85 ? "text-amber-600" : "text-slate-700"}`}>
                        {c.avg}% ({c.present}/{c.total})
                      </span>
                    </div>
                  ))}
                </div>
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
                    {DAILY_RECORDS.map((r) => {
                      const count = days.filter((d) => r[d]).length;
                      return (
                        <TableRow key={r.student} className="hover:bg-slate-50 border-slate-100">
                          <TableCell className="text-[13px] font-medium text-slate-900 pl-6">{r.student}</TableCell>
                          <TableCell className="text-[13px] text-slate-600">{r.class}</TableCell>
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
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-[11px] font-semibold uppercase text-slate-500 pl-6">Student</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase text-slate-500">Class</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase text-slate-500 pr-6">Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DEFAULTERS.sort((a, b) => a.attendance - b.attendance).map((d) => (
                      <TableRow key={d.name} className="hover:bg-slate-50 border-slate-100">
                        <TableCell className="text-[13px] font-medium text-slate-900 pl-6">{d.name}</TableCell>
                        <TableCell className="text-[13px] text-slate-600">{d.class}</TableCell>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
