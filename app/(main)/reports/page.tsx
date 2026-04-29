"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload, faTrophy, faDollarSign, faUsers, faBookOpen,
  faChartLine, faBus,
} from "@fortawesome/free-solid-svg-icons";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Label,
} from "recharts";

// ── Data ─────────────────────────────────────────────────────────────────────

const REVENUE_DATA = [
  { month: "Jan", collected: 920000,  expected: 1050000 },
  { month: "Feb", collected: 880000,  expected: 1050000 },
  { month: "Mar", collected: 1020000, expected: 1100000 },
  { month: "Apr", collected: 970000,  expected: 1100000 },
  { month: "May", collected: 860000,  expected: 1000000 },
  { month: "Jun", collected: 1150000, expected: 1200000 },
];

const PERFORMANCE_DATA = [
  { class: "Class 6",  avg: 74 },
  { class: "Class 7",  avg: 71 },
  { class: "Class 8",  avg: 76 },
  { class: "Class 9",  avg: 69 },
  { class: "Class 10", avg: 82 },
  { class: "Class 11", avg: 78 },
  { class: "Class 12", avg: 85 },
];

const GENDER_DATA = [
  { name: "Female", value: 218, fill: "var(--color-female)" },
  { name: "Male",   value: 193, fill: "var(--color-male)"   },
];

const totalStudents = GENDER_DATA.reduce((a, c) => a + c.value, 0);

const SUBJECT_PERF = [
  { subject: "Mathematics",    avg: 74 },
  { subject: "Science",        avg: 79 },
  { subject: "English",        avg: 82 },
  { subject: "Social Studies", avg: 76 },
  { subject: "Hindi",          avg: 71 },
  { subject: "Computer Sc.",   avg: 86 },
];

const REPORT_CARDS = [
  { title: "Student Performance Report", desc: "Class-wise academic performance summary for the current term.",   icon: faTrophy,     color: "text-blue-600",    bg: "bg-blue-50"    },
  { title: "Financial Summary Report",   desc: "Collected vs expected fees, monthly revenue breakdown.",          icon: faDollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Attendance Report",          desc: "Student-wise and class-wise attendance analysis.",                icon: faUsers,      color: "text-amber-600",   bg: "bg-amber-50"   },
  { title: "Exam Results Report",        desc: "Term exam scores, grade distributions and toppers.",              icon: faBookOpen,   color: "text-purple-600",  bg: "bg-purple-50"  },
  { title: "Enrollment Report",          desc: "Student enrollment trends across classes and sections.",          icon: faChartLine,  color: "text-rose-600",    bg: "bg-rose-50"    },
  { title: "Transport Usage Report",     desc: "Route-wise ridership and transport fee collection.",              icon: faBus,        color: "text-cyan-600",    bg: "bg-cyan-50"    },
];

// ── Chart configs ────────────────────────────────────────────────────────────

const revenueConfig: ChartConfig = {
  collected: { label: "Collected", color: "var(--chart-1)" },
  expected:  { label: "Expected",  color: "var(--chart-3)" },
};

const perfConfig: ChartConfig = {
  avg: { label: "Avg %", color: "var(--chart-1)" },
};

const genderConfig: ChartConfig = {
  value:  { label: "Students" },
  female: { label: "Female", color: "var(--chart-4)" },
  male:   { label: "Male",   color: "var(--chart-2)" },
};

const subjectConfig: ChartConfig = {
  avg: { label: "Avg %", color: "var(--chart-1)" },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date("2025-01-01"),
    to:   new Date("2025-06-30"),
  });
  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Students",   value: "411"   },
            { label: "Avg Performance",  value: "76.4%" },
            { label: "Fees Collected",   value: "₹58.0L" },
            { label: "Avg Attendance",   value: "87.2%" },
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
        <Tabs defaultValue="overview">
          <div className="flex items-center justify-between">
            <TabsList className="bg-slate-100 h-8 p-0.5">
              {["overview", "financial", "academic"].map((t) => (
                <TabsTrigger
                  key={t} value={t}
                  className="text-[12px] h-7 capitalize data-[state=active]:bg-white data-[state=active]:text-[#212529] data-[state=active]:shadow-none"
                >
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
            {/* Date range picker */}
            <Popover>
              <PopoverTrigger asChild>
                <button className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] text-slate-700 hover:bg-slate-50 transition-colors",
                  !range?.from && "text-slate-400"
                )}>
                  <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                  {range?.from ? (
                    range.to ? (
                      <>{format(range.from, "MMM d, yyyy")} → {format(range.to, "MMM d, yyyy")}</>
                    ) : (
                      format(range.from, "MMM d, yyyy")
                    )
                  ) : (
                    "Pick a date range"
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* ── Overview ── */}
          <TabsContent value="overview" className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Gender donut */}
              <Card className="shadow-none border-slate-200 flex flex-col">
                <CardHeader className="pb-0 items-center">
                  <CardTitle className="text-[13px]">Gender Distribution</CardTitle>
                  <CardDescription className="text-[12px]">Total enrolment by gender</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer config={genderConfig} className="mx-auto aspect-square max-h-[180px]">
                    <PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie data={GENDER_DATA} dataKey="value" nameKey="name" innerRadius={46} outerRadius={72} strokeWidth={3}>
                        {GENDER_DATA.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">{totalStudents}</tspan>
                                  <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 18} className="fill-muted-foreground text-[11px]">Students</tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </CardContent>
                <div className="flex justify-center gap-5 px-5 pb-4 pt-2">
                  {GENDER_DATA.map((g) => (
                    <div key={g.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: g.fill }} />
                      <span className="text-[11px] text-slate-500">{g.name} ({g.value})</span>
                    </div>
                  ))}
                </div>
              </Card>
              {/* Class performance bar */}
              <Card className="shadow-none border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[13px]">Class Performance Overview</CardTitle>
                  <CardDescription className="text-[12px]">Average score per class</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={perfConfig} className="h-[200px] w-full">
                    <BarChart data={PERFORMANCE_DATA} barSize={18} margin={{ left: 0, right: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="class" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={8} />
                      <YAxis tick={{ fontSize: 11 }} domain={[60, 100]} axisLine={false} tickLine={false} width={32} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Bar dataKey="avg" fill="var(--color-avg)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-2"><CardTitle className="text-[13px]">Downloadable Reports</CardTitle></CardHeader>
              <Separator />
              <CardContent className="pt-4 grid grid-cols-3 gap-3">
                {REPORT_CARDS.map((r) => (
                  <div key={r.title} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
                    <div className={`w-8 h-8 rounded-lg ${r.bg} flex items-center justify-center shrink-0`}>
                      <FontAwesomeIcon icon={r.icon} className={`${r.color} text-[12px]`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-slate-800 leading-tight">{r.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{r.desc}</p>
                      <Button variant="outline" size="sm" className="h-6 text-[11px] mt-2 gap-1 border-slate-200">
                        <FontAwesomeIcon icon={faDownload} className="text-[9px]" /> Download
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          {/* ── Financial ── */}
          <TabsContent value="financial" className="mt-4 flex flex-col gap-4">
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px]">Monthly Revenue: Collected vs Expected</CardTitle>
                <CardDescription className="text-[12px]">Fee collection performance over 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={revenueConfig} className="h-[280px] w-full">
                  <BarChart data={REVENUE_DATA} barGap={4} barSize={22} margin={{ left: 0, right: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={8} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} axisLine={false} tickLine={false} width={44} />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent formatter={(v) => `₹${(Number(v) / 100000).toFixed(2)}L`} />}
                    />
                    <Bar dataKey="collected" fill="var(--color-collected)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="expected"  fill="var(--color-expected)"  radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-2"><CardTitle className="text-[13px]">Monthly Summary</CardTitle></CardHeader>
              <Separator />
              <CardContent className="pt-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Month", "Collected", "Expected", "Shortfall", "Collection %"].map((h) => (
                        <th key={h} className="py-2.5 px-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-50">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {REVENUE_DATA.map((r) => {
                      const pct = Math.round((r.collected / r.expected) * 100);
                      return (
                        <tr key={r.month} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-[13px] font-medium text-slate-800">{r.month}</td>
                          <td className="py-2.5 px-3 text-[13px] text-slate-700">₹{(r.collected / 100000).toFixed(2)}L</td>
                          <td className="py-2.5 px-3 text-[13px] text-slate-700">₹{(r.expected / 100000).toFixed(2)}L</td>
                          <td className="py-2.5 px-3 text-[13px] text-rose-600">₹{((r.expected - r.collected) / 100000).toFixed(2)}L</td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[12px] font-semibold ${pct >= 95 ? "text-emerald-600" : pct >= 85 ? "text-amber-600" : "text-rose-600"}`}>
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          {/* ── Academic ── */}
          <TabsContent value="academic" className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Horizontal bar – class avg */}
              <Card className="shadow-none border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[13px]">Class-wise Average Score</CardTitle>
                  <CardDescription className="text-[12px]">Average exam score per class</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={perfConfig} className="h-[240px] w-full">
                    <BarChart data={PERFORMANCE_DATA} layout="vertical" barSize={14} margin={{ left: 0, right: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" domain={[60, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="class" tick={{ fontSize: 11 }} width={58} axisLine={false} tickLine={false} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Bar dataKey="avg" fill="var(--color-avg)" radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              {/* Subject performance */}
              <Card className="shadow-none border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[13px]">Subject Performance</CardTitle>
                  <CardDescription className="text-[12px]">Average score per subject</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 flex flex-col gap-2.5">
                  {SUBJECT_PERF.map((s) => (
                    <div key={s.subject}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[12px] text-slate-700">{s.subject}</span>
                        <span className="text-[12px] font-semibold text-slate-800">{s.avg}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#007BFF] rounded-full transition-all" style={{ width: `${s.avg}%` }} />
                      </div>
                    </div>
                  ))}
                  {/* Mini subject bar chart */}
                  <div className="mt-3">
                    <ChartContainer config={subjectConfig} className="h-[140px] w-full">
                      <BarChart data={SUBJECT_PERF} barSize={16} margin={{ left: 0, right: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="subject" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={6} />
                        <YAxis tick={{ fontSize: 10 }} domain={[60, 100]} axisLine={false} tickLine={false} width={28} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="avg" fill="var(--color-avg)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
