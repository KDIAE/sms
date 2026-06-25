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
import { classesApi, type Class } from "@/lib/api";
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
  value: { label: "Students" },
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

const CLASS_CHART_COLORS = [
  "#007BFF",
  "#0EA5E9",
  "#8B5CF6",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#14B8A6",
  "#EC4899",
  "#6366F1",
  "#84CC16",
];

type PieDatum = {
  name: string;
  value: number;
  fill: string;
};

type TooltipPayload = {
  value?: number | string;
};

type TooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
};

const attendanceBarTotals = {
  present: monthlyAttendanceData.reduce((a, c) => a + c.present, 0),
  absent:  monthlyAttendanceData.reduce((a, c) => a + c.absent,  0),
};

function RevenueTooltip({ active, payload, label }: TooltipProps) {
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

function AttendanceTooltip({ active, payload, label }: TooltipProps) {
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
  const [classDistribution, setClassDistribution] = React.useState<PieDatum[]>([]);
  const [classesLoading, setClassesLoading] = React.useState(true);
  const [classesError, setClassesError] = React.useState("");

  React.useEffect(() => {
    let ignore = false;

    classesApi.list()
      .then((classes: Class[]) => {
        if (ignore) return;
        setClassDistribution(
          classes.map((item, index) => ({
            name: item.name,
            value: item.student_count,
            fill: CLASS_CHART_COLORS[index % CLASS_CHART_COLORS.length],
          }))
        );
        setClassesError("");
      })
      .catch((error: unknown) => {
        if (ignore) return;
        setClassesError(error instanceof Error ? error.message : "Failed to load class distribution.");
      })
      .finally(() => {
        if (!ignore) setClassesLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const totalStudents = React.useMemo(
    () => classDistribution.reduce((sum, item) => sum + item.value, 0),
    [classDistribution]
  );
  const hasStudentsInDistribution = totalStudents > 0;

  return (
    <>
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="shadow-none border-slate-200 py-0">
              <CardContent className="p-4 md:p-5">
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
                <p className="text-[12px] text-slate-400 leading-relaxed">{s.label} · {s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Revenue + Pie */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
          {/* Revenue area chart */}
          <Card className="shadow-none border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-[14px] font-semibold">Monthly Revenue</CardTitle>
              <CardDescription className="text-[12px]">Fee collection overview for the academic year</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueConfig} className="h-[180px] sm:h-[200px] w-full">
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
              <CardDescription className="text-[12px] text-center">Live enrolment breakdown from classes</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              {classesLoading ? (
                <div className="flex h-[220px] flex-col items-center justify-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <div className="h-[144px] w-[144px] rounded-full bg-slate-100 animate-pulse" />
                    <div className="absolute h-[88px] w-[88px] rounded-full bg-white" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="h-2.5 w-20 rounded bg-slate-100 animate-pulse" />
                    <div className="h-2 w-14 rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>
              ) : classesError ? (
                <div className="flex h-[220px] items-center justify-center px-4 text-center text-[12px] text-red-500">
                  {classesError}
                </div>
              ) : classDistribution.length === 0 || !hasStudentsInDistribution ? (
                <div className="flex h-[220px] flex-col items-center justify-center gap-3 px-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <FontAwesomeIcon icon={faUsers} className="text-[18px]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[13px] font-medium text-slate-600">No student distribution yet</p>
                    <p className="text-[12px] text-slate-400">Students will appear here once they are assigned to classes.</p>
                  </div>
                </div>
              ) : (
                <ChartContainer config={pieConfig} className="mx-auto aspect-square max-h-[180px] sm:max-h-[220px]">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie data={classDistribution} dataKey="value" nameKey="name" innerRadius={46} outerRadius={72} strokeWidth={3}>
                      {classDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl sm:text-2xl font-bold">{totalStudents}</tspan>
                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 18} className="fill-muted-foreground text-[11px]">Students</tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Attendance + Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Attendance line chart */}
          <Card className="shadow-none border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-[14px] font-semibold">Attendance Trend</CardTitle>
              <CardDescription className="text-[12px]">School-wide % this session</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={attendanceConfig} className="h-[160px] sm:h-[180px] w-full">
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
            <div className="flex flex-1 flex-col justify-center gap-1 px-4 sm:px-6 pt-4 pb-3 sm:py-6">
              <CardTitle className="text-[14px] font-semibold">Monthly Attendance</CardTitle>
              <CardDescription className="text-[12px]">Daily present / absent counts this session</CardDescription>
            </div>
            <div className="grid grid-cols-2 sm:flex">
              {(["present", "absent"] as const).map((key) => (
                <button
                  key={key}
                  data-active={activeBar === key}
                  onClick={() => setActiveBar(key)}
                  className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-4 sm:px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-5"
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
            <ChartContainer config={attendanceBarConfig} className="aspect-auto h-[180px] sm:h-[200px] w-full">
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
