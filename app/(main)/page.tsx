"use client";

import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers, faGraduationCap, faDollarSign, faArrowTrendUp,
  faTriangleExclamation, faCircleCheck, faClock, faArrowTrendDown,
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Label,
} from "recharts";

// ── Data ────────────────────────────────────────────────────────────────────

const attendanceData = [
  { month: "Sep", rate: 91 }, { month: "Oct", rate: 88 }, { month: "Nov", rate: 93 },
  { month: "Dec", rate: 79 }, { month: "Jan", rate: 94 }, { month: "Feb", rate: 96 },
  { month: "Mar", rate: 92 }, { month: "Apr", rate: 90 },
];

const revenueData = [
  { month: "Sep", revenue: 120000 }, { month: "Oct", revenue: 110000 }, { month: "Nov", revenue: 135000 },
  { month: "Dec", revenue: 65000 },  { month: "Jan", revenue: 140000 }, { month: "Feb", revenue: 148000 },
  { month: "Mar", revenue: 155000 }, { month: "Apr", revenue: 128000 },
];

const classDistribution = [
  { name: "Nursery", value: 45,  fill: "var(--color-nursery)" },
  { name: "Class 1", value: 68,  fill: "var(--color-class1)" },
  { name: "Class 2", value: 72,  fill: "var(--color-class2)" },
  { name: "Class 3", value: 65,  fill: "var(--color-class3)" },
  { name: "Class 4", value: 58,  fill: "var(--color-class4)" },
  { name: "Class 5", value: 54,  fill: "var(--color-class5)" },
  { name: "Class 6", value: 49,  fill: "var(--color-class6)" },
];

const monthlyAttendanceData = [
  { month: "Sep", present: 374, absent: 37 },
  { month: "Oct", present: 362, absent: 49 },
  { month: "Nov", present: 382, absent: 29 },
  { month: "Dec", present: 325, absent: 86 },
  { month: "Jan", present: 387, absent: 24 },
  { month: "Feb", present: 395, absent: 16 },
  { month: "Mar", present: 378, absent: 33 },
  { month: "Apr", present: 370, absent: 41 },
];

// ── Chart configs ────────────────────────────────────────────────────────────

const revenueConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
};

const attendanceConfig: ChartConfig = {
  rate: { label: "Attendance", color: "var(--chart-2)" },
};

const attendanceBarConfig: ChartConfig = {
  totals:  { label: "Total" },
  present: { label: "Present", color: "var(--chart-2)" },
  absent:  { label: "Absent",  color: "var(--chart-5)" },
} satisfies ChartConfig;

const pieConfig: ChartConfig = {
  value:   { label: "Students" },
  nursery: { label: "Nursery", color: "var(--chart-1)" },
  class1:  { label: "Class 1", color: "var(--chart-2)" },
  class2:  { label: "Class 2", color: "var(--chart-3)" },
  class3:  { label: "Class 3", color: "var(--chart-4)" },
  class4:  { label: "Class 4", color: "var(--chart-5)" },
  class5:  { label: "Class 5", color: "var(--chart-1)" },
  class6:  { label: "Class 6", color: "var(--chart-2)" },
};

// ── Misc ─────────────────────────────────────────────────────────────────────

const alerts = [
  { type: "warning", message: "15 students have attendance below 75%", time: "2h ago" },
  { type: "error",   message: "32 fee payments overdue this month",     time: "4h ago" },
  { type: "info",    message: "Term 2 exams scheduled for May 5–15",    time: "1d ago" },
  { type: "success", message: "April payroll processed successfully",   time: "1d ago" },
];
type AlertIcon = { icon: typeof faTriangleExclamation; color: string };
const alertMeta: Record<string, AlertIcon> = {
  warning: { icon: faTriangleExclamation, color: "#d97706" },
  error:   { icon: faTriangleExclamation, color: "#dc2626" },
  info:    { icon: faClock,               color: "#007BFF"  },
  success: { icon: faCircleCheck,         color: "#059669"  },
};

const stats = [
  { label: "Total Students",  value: "411",    trend: "+12",    trendUp: true,  sub: "vs last month", icon: faUsers },
  { label: "Total Teachers",  value: "34",     trend: "+2",     trendUp: true,  sub: "vs last month", icon: faGraduationCap },
  { label: "Monthly Revenue", value: "₹1.28L", trend: "-15.7%", trendUp: false, sub: "vs last month", icon: faDollarSign },
  { label: "Avg. Attendance", value: "90%",    trend: "-2%",    trendUp: false, sub: "this month",    icon: faArrowTrendUp },
];

const totalStudents = classDistribution.reduce((a, c) => a + c.value, 0);

const attendanceBarTotals = {
  present: monthlyAttendanceData.reduce((a, c) => a + c.present, 0),
  absent:  monthlyAttendanceData.reduce((a, c) => a + c.absent,  0),
};

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-6">
        <span className="text-[11px] text-slate-500">{label}</span>
        <span className="text-[11px] font-semibold text-slate-800">
          ₹{Number(payload[0].value).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function AttendanceTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-6">
        <span className="text-[11px] text-slate-500">{label}</span>
        <span className="text-[11px] font-semibold text-slate-800">
          {payload[0].value}%
        </span>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeBar, setActiveBar] = React.useState<"present" | "absent">("present");

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="shadow-none border-slate-200 py-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={s.icon} className="text-slate-600 text-[15px]" />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold ${s.trendUp ? "text-emerald-600" : "text-red-500"}`}>
                    <FontAwesomeIcon icon={s.trendUp ? faArrowTrendUp : faArrowTrendDown} className="text-[11px]" />
                    {s.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-0.5">{s.value}</p>
                <p className="text-[12px] text-slate-400">{s.label} · {s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Revenue + Pie */}
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          {/* Revenue area chart */}
          <Card className="shadow-none border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-[14px] font-semibold">Monthly Revenue</CardTitle>
              <CardDescription className="text-[12px]">Fee collection overview for the academic year</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueConfig} className="h-[200px] w-full">
                <AreaChart data={revenueData} margin={{ left: 0, right: 0 }}>
                  <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--color-revenue)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={8} />
                  <YAxis tickFormatter={(v) => `₹${v / 1000}K`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={52} />
                  <ChartTooltip
                    cursor={false}
                    content={<RevenueTooltip />}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} fill="url(#fillRevenue)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
          {/* Donut – students by class */}
          <Card className="shadow-none border-slate-200 flex flex-col">
            <CardHeader className="pb-0 items-center">
              <CardTitle className="text-[14px] font-semibold">Students by Class</CardTitle>
              <CardDescription className="text-[12px]">Total enrolment breakdown</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer config={pieConfig} className="mx-auto aspect-square max-h-[180px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie data={classDistribution} dataKey="value" nameKey="name" innerRadius={46} outerRadius={72} strokeWidth={3}>
                    {classDistribution.map((entry, i) => (
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
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-5 pb-4 pt-2">
              {classDistribution.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: c.fill }} />
                  <span className="text-[11px] text-slate-500">{c.name} ({c.value})</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        {/* Attendance + Alerts */}
        <div className="grid grid-cols-2 gap-4">
          {/* Attendance line chart */}
          <Card className="shadow-none border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-[14px] font-semibold">Attendance Trend</CardTitle>
              <CardDescription className="text-[12px]">School-wide % this session</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={attendanceConfig} className="h-[160px] w-full">
                <LineChart data={attendanceData} margin={{ left: 0, right: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={8} />
                  <YAxis domain={[70, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={34} />
                  <ChartTooltip cursor={false} content={<AttendanceTooltip />} />
                  <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-rate)" }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
          {/* System alerts */}
          <Card className="shadow-none border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-[14px] font-semibold">System Alerts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {alerts.map((a, i) => {
                const cfg = alertMeta[a.type];
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <FontAwesomeIcon icon={cfg.icon} color={cfg.color} className="mt-0.5 shrink-0 text-[13px]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-700 leading-snug">{a.message}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
        {/* Interactive attendance bar chart */}
        <Card className="shadow-none border-slate-200 py-0">
          <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6">
              <CardTitle className="text-[14px] font-semibold">Monthly Attendance</CardTitle>
              <CardDescription className="text-[12px]">Daily present / absent counts this session</CardDescription>
            </div>
            <div className="flex">
              {(["present", "absent"] as const).map((key) => (
                <button
                  key={key}
                  data-active={activeBar === key}
                  onClick={() => setActiveBar(key)}
                  className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-5"
                >
                  <span className="text-xs text-muted-foreground">{attendanceBarConfig[key].label}</span>
                  <span className="text-lg font-bold leading-none sm:text-2xl">
                    {attendanceBarTotals[key].toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <ChartContainer config={attendanceBarConfig} className="aspect-auto h-[200px] w-full">
              <BarChart data={monthlyAttendanceData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[140px]"
                      nameKey="totals"
                      labelFormatter={(v) => `${v} 2025–26`}
                    />
                  }
                />
                <Bar dataKey={activeBar} fill={`var(--color-${activeBar})`} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
