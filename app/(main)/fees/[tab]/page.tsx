"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  smsFeesApi,
  studentsApi,
  type SmsFeeDashboard,
  type SmsAdmissionFeeRow,
  type SmsTuitionRow,
  type SmsItemFeeRow,
  type Student,
} from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type PaymentMethod = "UPI" | "NEFT" | "Cash" | "Cheque";
type FeeTypeOption = "Admission" | "Monthly Tuition" | "Books" | "Uniform";

const VALID_TABS = ["dashboard", "admissions", "tuition", "books", "uniforms"] as const;
type TabValue = typeof VALID_TABS[number];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers / shared UI
// ─────────────────────────────────────────────────────────────────────────────

const statusCls: Record<string, string> = {
  Paid:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
  Unpaid:  "bg-red-50 text-red-700 border-red-200",
  Waived:  "bg-slate-100 text-slate-500 border-slate-200",
};
const methodCls: Record<string, string> = {
  UPI:    "bg-violet-50 text-violet-700 border-violet-200",
  NEFT:   "bg-blue-50 text-blue-700 border-blue-200",
  Cash:   "bg-slate-100 text-slate-700 border-slate-200",
  Cheque: "bg-orange-50 text-orange-700 border-orange-200",
  "—":    "bg-slate-50 text-slate-400 border-slate-100",
};

function StatusBadge({ s }: { s: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusCls[s] ?? statusCls["Unpaid"]}`}>
      {s}
    </span>
  );
}
function MethodBadge({ m }: { m: string | null }) {
  const label = m ?? "—";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${methodCls[label] ?? methodCls["—"]}`}>
      {label}
    </span>
  );
}
function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <Card className="shadow-none border-slate-200 py-0">
      <CardContent className="p-4">
        <p className={`text-2xl font-bold ${accent ? "text-[#007BFF]" : "text-slate-900"}`}>{value}</p>
        <p className="text-[12px] text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

const revenueConfig: ChartConfig = {
  expected:  { label: "Target",    color: "#e2e8f0" },
  collected: { label: "Collected", color: "#007BFF" },
};

// ─────────────────────────────────────────────────────────────────────────────
// RecordPaymentPopover
// ─────────────────────────────────────────────────────────────────────────────

function RecordPaymentPopover({
  trigger, studentName, feeType, totalAmount, currentPaid, onRecord,
}: {
  trigger: React.ReactNode;
  studentName: string;
  feeType: string;
  totalAmount: number;
  currentPaid: number;
  onRecord: (amount: number, method: PaymentMethod, date: string) => void;
}) {
  const [amount, setAmount] = useState(String(totalAmount - currentPaid));
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [date,   setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [open,   setOpen]   = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <p className="text-[13px] font-semibold text-slate-800 mb-0.5">Record Payment</p>
        <p className="text-[11px] text-slate-400 mb-3">{studentName} · {feeType}</p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Amount (₹)</label>
            <Input className="h-8 text-[12px]" type="number" value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={`Balance: ₹${(totalAmount - currentPaid).toLocaleString()}`} />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Payment Method</label>
            <Select value={method} onValueChange={v => setMethod(v as PaymentMethod)}>
              <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["UPI", "NEFT", "Cash", "Cheque"] as PaymentMethod[]).map(m => (
                  <SelectItem key={m} value={m} className="text-[12px]">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Date</label>
            <Input className="h-8 text-[12px]" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <Button size="sm" className="w-full bg-[#007BFF] hover:bg-[#0062cc] text-[12px]"
            disabled={!amount || Number(amount) <= 0}
            onClick={() => { onRecord(Number(amount), method, date); setOpen(false); }}>
            Record Payment
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LogFeeDialog
// ─────────────────────────────────────────────────────────────────────────────

function LogFeeDialog({ open, onClose, monthKeys, monthLabels, students, onRecord }: {
  open: boolean;
  onClose: () => void;
  monthKeys: string[];
  monthLabels: string[];
  students: Student[];
  onRecord: (
    studentId: string, feeType: FeeTypeOption, monthKey: string | null,
    amount: number, method: PaymentMethod, date: string,
  ) => Promise<void>;
}) {
  const [studentId, setStudentId] = useState("");
  const [feeType,   setFeeType]   = useState<FeeTypeOption>("Monthly Tuition");
  const [monthKey,  setMonthKey]  = useState<string>(monthKeys[0] ?? "");
  const [amount,    setAmount]    = useState("");
  const [method,    setMethod]    = useState<PaymentMethod>("UPI");
  const [date,      setDate]      = useState(new Date().toISOString().slice(0, 10));
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!studentId || !amount || Number(amount) <= 0) return;
    setLoading(true);
    try {
      await onRecord(studentId, feeType, feeType === "Monthly Tuition" ? monthKey : null, Number(amount), method, date);
      setStudentId(""); setFeeType("Monthly Tuition"); setAmount(""); setMethod("UPI");
      setDate(new Date().toISOString().slice(0, 10));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Log Fee Payment</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Student</label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger className="h-9 text-[12px]"><SelectValue placeholder="Select student…" /></SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id} className="text-[12px]">
                    {s.name} · {s.class_name} · {s.roll_no}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Fee Type</label>
            <Select value={feeType} onValueChange={v => setFeeType(v as FeeTypeOption)}>
              <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["Admission", "Monthly Tuition", "Books", "Uniform"] as FeeTypeOption[]).map(t => (
                  <SelectItem key={t} value={t} className="text-[12px]">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {feeType === "Monthly Tuition" && monthKeys.length > 0 && (
            <div>
              <label className="text-[11px] text-slate-500 font-medium mb-1 block">Month</label>
              <Select value={monthKey} onValueChange={setMonthKey}>
                <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {monthKeys.map((mk, i) => (
                    <SelectItem key={mk} value={mk} className="text-[12px]">{monthLabels[i]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Amount (₹)</label>
            <Input className="h-9 text-[12px]" type="number" min={1} value={amount}
              onChange={e => setAmount(e.target.value)} placeholder="Enter amount" />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Payment Method</label>
            <Select value={method} onValueChange={v => setMethod(v as PaymentMethod)}>
              <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["UPI", "NEFT", "Cash", "Cheque"] as PaymentMethod[]).map(m => (
                  <SelectItem key={m} value={m} className="text-[12px]">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Date</label>
            <Input className="h-9 text-[12px]" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" className="text-[12px]" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-[#007BFF] hover:bg-[#0062cc] text-[12px]"
            disabled={!studentId || !amount || Number(amount) <= 0 || loading}
            onClick={handleSubmit}>
            {loading ? "Saving…" : "Log Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function FeesPage() {
  const router = useRouter();
  const params = useParams();
  const rawTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const tab: TabValue = VALID_TABS.includes(rawTab as TabValue) ? (rawTab as TabValue) : "dashboard";

  const navigateTab = (value: string) => router.push(`/fees/${value}`);

  const [classFilter,  setClassFilter]  = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search,       setSearch]       = useState("");
  const [logFeeOpen,   setLogFeeOpen]   = useState(false);

  // ── Remote data ──
  const [dashboard,      setDashboard]      = useState<SmsFeeDashboard | null>(null);
  const [admissionRows,  setAdmissionRows]  = useState<SmsAdmissionFeeRow[]>([]);
  const [tuitionRows,    setTuitionRows]    = useState<SmsTuitionRow[]>([]);
  const [bookRows,       setBookRows]       = useState<SmsItemFeeRow[]>([]);
  const [uniformRows,    setUniformRows]    = useState<SmsItemFeeRow[]>([]);
  const [allStudents,    setAllStudents]    = useState<Student[]>([]);
  const [classes,        setClasses]        = useState<string[]>([]);

  const [loadingDash,    setLoadingDash]    = useState(true);
  const [loadingAdm,     setLoadingAdm]     = useState(false);
  const [loadingTui,     setLoadingTui]     = useState(false);
  const [loadingItems,   setLoadingItems]   = useState(false);

  // ── Fetch dashboard ──
  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    try {
      const data = await smsFeesApi.summary();
      setDashboard(data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoadingDash(false);
    }
  }, []);

  // ── Fetch admission tab ──
  const fetchAdmission = useCallback(async () => {
    setLoadingAdm(true);
    try {
      const q: Record<string, string> = {};
      if (classFilter !== "All") q.class_name = classFilter;
      if (search) q.search = search;
      const params = new URLSearchParams(q).toString();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/fees/sms/admission${params ? `?${params}` : ""}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}` } }
      );
      setAdmissionRows(await res.json());
    } finally { setLoadingAdm(false); }
  }, [classFilter, search]);

  // ── Fetch tuition tab ──
  const fetchTuition = useCallback(async () => {
    setLoadingTui(true);
    try {
      const q: Record<string, string> = {};
      if (classFilter !== "All") q.class_name = classFilter;
      if (search) q.search = search;
      const params = new URLSearchParams(q).toString();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/fees/sms/tuition${params ? `?${params}` : ""}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}` } }
      );
      setTuitionRows(await res.json());
    } finally { setLoadingTui(false); }
  }, [classFilter, search]);

  // ── Fetch item fees ──
  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const q: Record<string, string> = {};
      if (classFilter !== "All") q.class_name = classFilter;
      if (search) q.search = search;
      const booksParams   = new URLSearchParams({ ...q, type: "Books" }).toString();
      const uniformParams = new URLSearchParams({ ...q, type: "Uniform" }).toString();
      const headers = { Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}` };
      const base = process.env.NEXT_PUBLIC_API_URL;
      const [bRes, uRes] = await Promise.all([
        fetch(`${base}/api/fees/sms/items?${booksParams}`,   { headers }),
        fetch(`${base}/api/fees/sms/items?${uniformParams}`, { headers }),
      ]);
      setBookRows(await bRes.json());
      setUniformRows(await uRes.json());
    } finally { setLoadingItems(false); }
  }, [classFilter, search]);

  // ── Fetch all students for LogFeeDialog dropdown ──
  const fetchAllStudents = useCallback(async () => {
    try {
      const res = await studentsApi.list({ limit: 200 });
      setAllStudents(res.data);
      const classSet = new Set(res.data.map(s => s.class_name).filter(Boolean));
      setClasses(Array.from(classSet).sort());
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchAllStudents();
  }, [fetchDashboard, fetchAllStudents]);

  // Re-fetch the relevant tab when filters change or tab switches
  useEffect(() => {
    if (tab === "admissions") fetchAdmission();
    if (tab === "tuition")    fetchTuition();
    if (tab === "books" || tab === "uniforms") fetchItems();
    if (tab === "dashboard")  fetchDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, classFilter, search]);

  // ── Record payment handler ──
  const handleRecord = async (
    studentId: string,
    feeType: FeeTypeOption,
    monthKey: string | null,
    amount: number,
    method: PaymentMethod,
    date: string,
  ) => {
    await smsFeesApi.record({ student_id: studentId, fee_type: feeType, month_key: monthKey ?? undefined, amount, method, date });
    fetchDashboard();
    if (feeType === "Admission")        fetchAdmission();
    if (feeType === "Monthly Tuition")  fetchTuition();
    if (feeType === "Books" || feeType === "Uniform") fetchItems();
  };

  const dash = dashboard;

  return (
    <>
      <LogFeeDialog
        open={logFeeOpen}
        onClose={() => setLogFeeOpen(false)}
        monthKeys={dash?.month_keys ?? []}
        monthLabels={dash?.month_labels ?? []}
        students={allStudents}
        onRecord={handleRecord}
      />
      <Tabs value={tab} onValueChange={navigateTab}>
        {/* Top nav */}
        <div className="flex items-center justify-between mb-5">
          <TabsList>
            <TabsTrigger value="dashboard"  className="text-[12px] h-6">Dashboard</TabsTrigger>
            <TabsTrigger value="admissions" className="text-[12px] h-6">Admissions</TabsTrigger>
            <TabsTrigger value="tuition"    className="text-[12px] h-6">Monthly Tuition</TabsTrigger>
            <TabsTrigger value="books"      className="text-[12px] h-6">Books</TabsTrigger>
            <TabsTrigger value="uniforms"   className="text-[12px] h-6">Uniforms</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 text-[12px] bg-[#007BFF] hover:bg-[#0062cc]" onClick={() => setLogFeeOpen(true)}>
              + Log Fee
            </Button>
            <Input className="h-8 w-44 text-[12px] bg-white" placeholder="Search student…"
              value={search} onChange={e => setSearch(e.target.value)} />
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="h-8 w-32 text-[12px] bg-white"><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="text-[12px]">All Classes</SelectItem>
                {classes.map(c => <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── DASHBOARD ── */}
        <TabsContent value="dashboard" className="mt-0">
          <div className="relative">
            {loadingDash && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
                <p className="text-slate-400 text-[13px]">Loading dashboard...</p>
              </div>
            )}
            {!loadingDash && !dash && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <p className="text-slate-400 text-[13px] mb-2">Failed to load data.</p>
                  <Button size="sm" onClick={fetchDashboard}>Retry</Button>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Collected (YTD)"  value={dash ? `₹${(dash.total_collected / 100000).toFixed(2)}L` : "₹0.00L"} accent />
                <StatCard label="Admission Collected"    value={dash ? `₹${(dash.admission_collected / 1000).toFixed(1)}K` : "₹0.0K"} />
                <StatCard label="Tuition Collected"      value={dash ? `₹${(dash.tuition_collected / 1000).toFixed(1)}K` : "₹0.0K"} sub={dash ? `Session ${dash.session}` : "Session 2025-26"} />
                <StatCard label="Overdue Accounts"       value={dash?.overdue_count ?? 0} sub="Students with pending dues" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Card className="shadow-none border-slate-200 col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[14px] font-semibold">Monthly Fee Collection {dash?.session ?? "2025-26"}</CardTitle>
                    <CardDescription className="text-[12px]">Tuition fees combined</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    {dash && dash.total_collected === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/60 backdrop-blur-[2px]">
                        <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-[13px] text-slate-400 font-medium">No collection data yet</p>
                        <p className="text-[11px] text-slate-300 mt-1">Record payments to see charts</p>
                      </div>
                    )}
                    <ChartContainer config={revenueConfig} className="h-[240px] w-full">
                      <BarChart data={dash?.monthly_chart ?? []} margin={{ left: 0, right: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={8} />
                        <YAxis tickFormatter={v => `₹${Number(v) / 1000}K`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={48} />
                        <ChartTooltip content={<ChartTooltipContent formatter={v => [`₹${Number(v).toLocaleString()}`]} />} />
                        <Bar dataKey="expected"  fill="var(--color-expected)"  radius={[3, 3, 0, 0]} />
                        <Bar dataKey="collected" fill="var(--color-collected)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
                <Card className="shadow-none border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[14px] font-semibold">Collection Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 relative">
                    {dash && dash.total_collected === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/60 backdrop-blur-[2px]">
                        <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="text-[12px] text-slate-400 font-medium">No data</p>
                      </div>
                    )}
                    {[
                      { label: "Admissions",      data: dash?.breakdown_admission ?? { collected: 0, target: 0 }, color: "bg-blue-500" },
                      { label: "Monthly Tuition", data: dash?.breakdown_tuition   ?? { collected: 0, target: 0 }, color: "bg-emerald-500" },
                      { label: "Books",           data: dash?.breakdown_books     ?? { collected: 0, target: 0 }, color: "bg-violet-500" },
                      { label: "Uniforms",        data: dash?.breakdown_uniforms  ?? { collected: 0, target: 0 }, color: "bg-amber-500" },
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
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── ADMISSIONS ── */}
        <TabsContent value="admissions" className="mt-0">
          <AdmissionTab
            rows={admissionRows}
            loading={loadingAdm}
            onRecord={(sid, amt, method, date) => handleRecord(sid, "Admission", null, amt, method, date)}
          />
        </TabsContent>

        {/* ── MONTHLY TUITION ── */}
        <TabsContent value="tuition" className="mt-0">
          <TuitionTab
            rows={tuitionRows}
            loading={loadingTui}
            monthKeys={dash?.month_keys ?? []}
            monthLabels={dash?.month_labels ?? []}
            onRecord={(sid, mk, amt, method, date) => handleRecord(sid, "Monthly Tuition", mk, amt, method, date)}
          />
        </TabsContent>

        {/* ── BOOKS ── */}
        <TabsContent value="books" className="mt-0">
          <ItemTab
            label="Books"
            rows={bookRows}
            loading={loadingItems}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onRecord={(sid, amt, method, date) => handleRecord(sid, "Books", null, amt, method, date)}
          />
        </TabsContent>

        {/* ── UNIFORMS ── */}
        <TabsContent value="uniforms" className="mt-0">
          <ItemTab
            label="Uniforms"
            rows={uniformRows}
            loading={loadingItems}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onRecord={(sid, amt, method, date) => handleRecord(sid, "Uniform", null, amt, method, date)}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Admission Tab
// ─────────────────────────────────────────────────────────────────────────────

function AdmissionTab({ rows, loading, onRecord }: {
  rows: SmsAdmissionFeeRow[];
  loading: boolean;
  onRecord: (sid: string, amt: number, method: PaymentMethod, date: string) => void;
}) {
  const totalCollected = rows.reduce((a, r) => a + r.paid, 0);
  const totalTarget    = rows.reduce((a, r) => a + r.total, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Target"  value={`₹${(totalTarget / 1000).toFixed(0)}K`} />
        <StatCard label="Collected"     value={`₹${(totalCollected / 1000).toFixed(1)}K`} accent />
        <StatCard label="Fully Paid"    value={rows.filter(r => r.status === "Paid").length} />
        <StatCard label="Outstanding"   value={rows.filter(r => r.status !== "Paid" && r.status !== "Waived").length} />
      </div>
      <Card className="shadow-none border-slate-200 pt-0">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-slate-400 text-[13px] py-12 text-center">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="w-16 h-16 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-[14px] text-slate-500 font-medium">No students found</p>
              <p className="text-[12px] text-slate-400 mt-1">Add students to track admission fees</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  {["Student","Class","Total","Paid","Balance","Date","Method","Status","Receipt",""].map((h, i) => (
                    <TableHead key={i} className={`text-[11px] font-semibold uppercase text-slate-500 ${h === "Student" ? "pl-6" : ""}`}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => {
                  const balance = r.total - r.paid;
                  return (
                    <TableRow key={r.student_id} className="hover:bg-slate-50 border-slate-100">
                      <TableCell className="pl-6">
                        <p className="text-[13px] font-medium text-slate-900">{r.name}</p>
                        <p className="text-[11px] text-slate-400">{r.roll_no}</p>
                      </TableCell>
                      <TableCell className="text-[13px] text-slate-600">{r.class_name}</TableCell>
                      <TableCell className="text-[13px] text-slate-700">₹{r.total.toLocaleString()}</TableCell>
                      <TableCell className="text-[13px] font-medium text-emerald-700">₹{r.paid.toLocaleString()}</TableCell>
                      <TableCell className={`text-[13px] font-medium ${balance > 0 ? "text-red-600" : "text-slate-400"}`}>
                        {balance > 0 ? `₹${balance.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell className="text-[13px] text-slate-500">{r.last_payment_date ?? "—"}</TableCell>
                      <TableCell><MethodBadge m={r.last_payment_method} /></TableCell>
                      <TableCell><StatusBadge s={r.status} /></TableCell>
                      <TableCell className="text-[12px] text-slate-400 font-mono">{r.receipt_no ?? "—"}</TableCell>
                      <TableCell className="pr-4">
                        {r.status !== "Paid" && r.status !== "Waived" && (
                          <RecordPaymentPopover
                            trigger={<Button size="sm" variant="outline" className="h-7 text-[11px] border-[#007BFF] text-[#007BFF] hover:bg-blue-50">Record</Button>}
                            studentName={r.name} feeType="Admission Fee"
                            totalAmount={r.total} currentPaid={r.paid}
                            onRecord={(amt, method, date) => onRecord(r.student_id, amt, method, date)}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tuition Tab
// ─────────────────────────────────────────────────────────────────────────────

function TuitionTab({ rows, loading, monthKeys, monthLabels, onRecord }: {
  rows: SmsTuitionRow[];
  loading: boolean;
  monthKeys: string[];
  monthLabels: string[];
  onRecord: (sid: string, monthKey: string, amt: number, method: PaymentMethod, date: string) => void;
}) {
  const totalCollected = rows.reduce((a, r) =>
    a + Object.values(r.payments).reduce((b, p) => b + p.amount, 0), 0);
  const now = new Date();

  const getUnpaidMonths = (row: SmsTuitionRow) =>
    monthKeys.filter(mk => new Date(mk + "-01") <= now && !row.payments[mk]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Tuition Collected"  value={`₹${(totalCollected / 1000).toFixed(1)}K`} accent />
        <StatCard label="Students Overdue"   value={rows.filter(r => getUnpaidMonths(r).length > 0).length} />
        <StatCard label="Total Students"     value={rows.length} />
        <StatCard label="Months in Session"  value={monthKeys.length} />
      </div>
      <Card className="shadow-none border-slate-200 overflow-x-auto pt-0">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-slate-400 text-[13px] py-12 text-center">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="w-16 h-16 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-[14px] text-slate-500 font-medium">No tuition records</p>
              <p className="text-[12px] text-slate-400 mt-1">Students will appear here once enrolled</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="pl-6 text-[11px] font-semibold uppercase text-slate-500 sticky left-0 bg-slate-50 z-10 min-w-[160px]">Student</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase text-slate-500 min-w-[80px]">Class</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase text-slate-500 min-w-[70px]">Monthly</TableHead>
                  {monthLabels.map((ml, i) => (
                    <TableHead key={monthKeys[i]} className="text-[11px] font-semibold uppercase text-slate-500 text-center min-w-[54px]">{ml}</TableHead>
                  ))}
                  <TableHead className="text-[11px] font-semibold uppercase text-slate-500 pr-4 min-w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => {
                  const unpaidMonths = getUnpaidMonths(r);
                  return (
                    <TableRow key={r.student_id} className="hover:bg-slate-50 border-slate-100">
                      <TableCell className="pl-6 sticky left-0 bg-white z-10">
                        <p className="text-[13px] font-medium text-slate-900">{r.name}</p>
                        <p className="text-[11px] text-slate-400">{r.roll_no}</p>
                      </TableCell>
                      <TableCell className="text-[13px] text-slate-600">{r.class_name}</TableCell>
                      <TableCell className="text-[13px] text-slate-700 font-medium">₹{r.monthly_amount.toLocaleString()}</TableCell>
                      {monthKeys.map(mk => {
                        const p = r.payments[mk];
                        const isFuture = new Date(mk + "-01") > now;
                        return (
                          <TableCell key={mk} className="text-center px-1">
                            {isFuture ? (
                              <span className="text-[10px] text-slate-300">—</span>
                            ) : p ? (
                              <span title={`${p.method} · ${p.date}`}
                                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="2,5 4.2,7.5 8,2.5" /></svg>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-400">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="2" y1="2" x2="8" y2="8" /><line x1="8" y1="2" x2="2" y2="8" /></svg>
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="pr-4">
                        {unpaidMonths.length > 0 && (
                          <RecordPaymentPopover
                            trigger={<Button size="sm" variant="outline" className="h-7 text-[11px] border-[#007BFF] text-[#007BFF] hover:bg-blue-50 whitespace-nowrap">Pay ({unpaidMonths.length})</Button>}
                            studentName={r.name}
                            feeType={`Tuition – ${unpaidMonths.length} month${unpaidMonths.length > 1 ? "s" : ""}`}
                            totalAmount={r.monthly_amount * unpaidMonths.length}
                            currentPaid={0}
                            onRecord={(amt, method, date) => {
                              let remaining = amt;
                              for (const mk of unpaidMonths) {
                                if (remaining <= 0) break;
                                const mAmt = Math.min(r.monthly_amount, remaining);
                                onRecord(r.student_id, mk, mAmt, method, date);
                                remaining -= mAmt;
                              }
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Item Fee Tab (Books / Uniforms)
// ─────────────────────────────────────────────────────────────────────────────

function ItemTab({ label, rows, loading, statusFilter, setStatusFilter, onRecord }: {
  label: string;
  rows: SmsItemFeeRow[];
  loading: boolean;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  onRecord: (sid: string, amt: number, method: PaymentMethod, date: string) => void;
}) {
  const totalCollected = rows.reduce((a, r) => a + r.paid, 0);
  const totalExpected  = rows.reduce((a, r) => a + r.total, 0);
  const filtered = statusFilter === "All" ? rows : rows.filter(r => r.status === statusFilter);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label={`${label} Collected`} value={`₹${(totalCollected / 1000).toFixed(1)}K`} accent />
        <StatCard label="Total Expected"       value={`₹${(totalExpected / 1000).toFixed(1)}K`} />
        <StatCard label="Fully Paid"           value={rows.filter(r => r.status === "Paid").length} />
        <StatCard label="Outstanding"          value={rows.filter(r => r.status !== "Paid" && r.status !== "Waived").length} />
      </div>
      <Card className="shadow-none border-slate-200 pt-0">
        <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-slate-100">
          <span className="text-[12px] text-slate-500 font-medium">Filter:</span>
          {(["All", "Paid", "Partial", "Unpaid"] as const).map(v => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold transition-all ${statusFilter === v ? "bg-[#007BFF] text-white border-[#007BFF]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
              {v}
            </button>
          ))}
        </div>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-slate-400 text-[13px] py-12 text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="w-16 h-16 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-[14px] text-slate-500 font-medium">No {label.toLowerCase()} fee records</p>
              <p className="text-[12px] text-slate-400 mt-1">
                {rows.length === 0 ? "Add students to track fees" : "No records match the selected filter"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  {["Student","Class","Description","Amount","Paid","Balance","Date","Method","Status","Receipt",""].map((h, i) => (
                    <TableHead key={i} className={`text-[11px] font-semibold uppercase text-slate-500 ${h === "Student" ? "pl-6" : ""}`}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => {
                  const balance = r.total - r.paid;
                  return (
                    <TableRow key={r.student_id + r.type} className="hover:bg-slate-50 border-slate-100">
                      <TableCell className="pl-6">
                        <p className="text-[13px] font-medium text-slate-900">{r.name}</p>
                        <p className="text-[11px] text-slate-400">{r.roll_no}</p>
                      </TableCell>
                      <TableCell className="text-[13px] text-slate-600">{r.class_name}</TableCell>
                      <TableCell className="text-[13px] text-slate-500 max-w-[180px] truncate">{r.description}</TableCell>
                      <TableCell className="text-[13px] text-slate-700">₹{r.total.toLocaleString()}</TableCell>
                      <TableCell className="text-[13px] font-medium text-emerald-700">₹{r.paid.toLocaleString()}</TableCell>
                      <TableCell className={`text-[13px] font-medium ${balance > 0 ? "text-red-600" : "text-slate-400"}`}>
                        {balance > 0 ? `₹${balance.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell className="text-[13px] text-slate-500">{r.last_payment_date ?? "—"}</TableCell>
                      <TableCell><MethodBadge m={r.last_payment_method} /></TableCell>
                      <TableCell><StatusBadge s={r.status} /></TableCell>
                      <TableCell className="text-[12px] text-slate-400 font-mono">{r.receipt_no ?? "—"}</TableCell>
                      <TableCell className="pr-4">
                        {r.status !== "Paid" && r.status !== "Waived" && (
                          <RecordPaymentPopover
                            trigger={<Button size="sm" variant="outline" className="h-7 text-[11px] border-[#007BFF] text-[#007BFF] hover:bg-blue-50">Record</Button>}
                            studentName={r.name} feeType={`${label} Fee`}
                            totalAmount={r.total} currentPaid={r.paid}
                            onRecord={(amt, method, date) => onRecord(r.student_id, amt, method, date)}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
