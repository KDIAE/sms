"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FeeStatus = "Paid" | "Partial" | "Unpaid" | "Waived";
type PaymentMethod = "UPI" | "NEFT" | "Cash" | "Cheque" | "—";

interface Student {
  id: string; name: string; class: string; section: string; rollNo: string;
}
interface AdmissionFee {
  studentId: string; amount: number; paid: number;
  date: string; method: PaymentMethod; status: FeeStatus; receiptNo: string;
}
interface MonthlyRecord {
  studentId: string;
  payments: Record<string, { amount: number; method: PaymentMethod; date: string; status: FeeStatus }>;
}
interface ItemFee {
  studentId: string; type: "Books" | "Uniform"; description: string;
  amount: number; paid: number; date: string; method: PaymentMethod;
  status: FeeStatus; receiptNo: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants & seed data
// ─────────────────────────────────────────────────────────────────────────────

const CLASSES    = ["Nursery","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6"];
const MONTHS     = ["Apr 25","May 25","Jun 25","Jul 25","Aug 25","Sep 25","Oct 25","Nov 25","Dec 25","Jan 26","Feb 26","Mar 26"];
const MONTH_KEYS = ["2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12","2026-01","2026-02","2026-03"];

const TUITION_BY_CLASS: Record<string,number> = {
  "Nursery":8000,"Class 1":8000,"Class 2":8000,"Class 3":9000,"Class 4":9000,"Class 5":10000,"Class 6":11000,
};
const ADMISSION_FEE = 15000;
const BOOK_FEE_BY_CLASS: Record<string,number> = {
  "Nursery":3000,"Class 1":3500,"Class 2":3500,"Class 3":4000,"Class 4":4000,"Class 5":4500,"Class 6":5000,
};
const UNIFORM_FEE = 3500;

const STUDENTS: Student[] = [
  { id:"S001", name:"Priya Chatterjee",  class:"Class 5", section:"A", rollNo:"501" },
  { id:"S002", name:"Arjun Mukherjee",   class:"Class 6", section:"A", rollNo:"601" },
  { id:"S003", name:"Sneha Banerjee",    class:"Class 4", section:"B", rollNo:"402" },
  { id:"S004", name:"Rohan Das",         class:"Class 3", section:"A", rollNo:"301" },
  { id:"S005", name:"Tanya Roy",         class:"Class 5", section:"B", rollNo:"502" },
  { id:"S006", name:"Akash Ghosh",       class:"Class 2", section:"A", rollNo:"201" },
  { id:"S007", name:"Ritika Sengupta",   class:"Class 6", section:"B", rollNo:"602" },
  { id:"S008", name:"Ananya Pal",        class:"Class 4", section:"A", rollNo:"401" },
  { id:"S009", name:"Dev Kumar",         class:"Class 1", section:"A", rollNo:"101" },
  { id:"S010", name:"Mira Joshi",        class:"Nursery", section:"A", rollNo:"N01" },
];

const initAdmission = (): Record<string,AdmissionFee> => {
  const statuses: FeeStatus[]    = ["Paid","Paid","Partial","Unpaid","Paid","Paid","Partial","Unpaid","Paid","Paid"];
  const methods: PaymentMethod[] = ["UPI","NEFT","Cash","—","UPI","Cash","NEFT","—","UPI","Cash"];
  const paidAmts = [15000,15000,7500,0,15000,15000,7500,0,15000,15000];
  return Object.fromEntries(STUDENTS.map((s,i) => [s.id, {
    studentId: s.id, amount: ADMISSION_FEE, paid: paidAmts[i],
    date: paidAmts[i]>0 ? `Apr ${3+i}, 2025` : "—",
    method: methods[i], status: statuses[i],
    receiptNo: paidAmts[i]>0 ? `ADM-${String(i+1).padStart(3,"0")}` : "—",
  }]));
};

const initMonthly = (): Record<string,MonthlyRecord> => {
  return Object.fromEntries(STUDENTS.map((s,si) => {
    const payments: MonthlyRecord["payments"] = {};
    MONTH_KEYS.forEach((mk,mi) => {
      if (mi < 8-(si%3)) {
        payments[mk] = {
          amount: TUITION_BY_CLASS[s.class],
          method: (["UPI","NEFT","Cash"] as PaymentMethod[])[si%3],
          date: `${MONTHS[mi]} ${mi<6?"5":"8"}`,
          status: "Paid",
        };
      }
    });
    return [s.id, { studentId: s.id, payments }];
  }));
};

const initItemFees = (): ItemFee[] => {
  const bookSt: FeeStatus[] = ["Paid","Paid","Partial","Unpaid","Paid","Paid","Unpaid","Partial","Paid","Paid"];
  const uniSt:  FeeStatus[] = ["Paid","Unpaid","Paid","Unpaid","Paid","Paid","Partial","Paid","Unpaid","Paid"];
  const fees: ItemFee[] = [];
  STUDENTS.forEach((s,i) => {
    fees.push({
      studentId:s.id, type:"Books",
      description:`${s.class} Textbook Set 2025–26`,
      amount: BOOK_FEE_BY_CLASS[s.class],
      paid: bookSt[i]==="Paid"?BOOK_FEE_BY_CLASS[s.class]:bookSt[i]==="Partial"?Math.floor(BOOK_FEE_BY_CLASS[s.class]/2):0,
      date: bookSt[i]!=="Unpaid"?`Apr ${5+i}, 2025`:"—",
      method: bookSt[i]!=="Unpaid"?(["UPI","Cash","NEFT"] as PaymentMethod[])[i%3]:"—",
      status: bookSt[i],
      receiptNo: bookSt[i]!=="Unpaid"?`BK-${String(i+1).padStart(3,"0")}`:"—",
    });
    fees.push({
      studentId:s.id, type:"Uniform",
      description:"School Uniform Set 2025–26",
      amount: UNIFORM_FEE,
      paid: uniSt[i]==="Paid"?UNIFORM_FEE:uniSt[i]==="Partial"?1500:0,
      date: uniSt[i]!=="Unpaid"?`May ${2+i}, 2025`:"—",
      method: uniSt[i]!=="Unpaid"?(["Cash","UPI","NEFT"] as PaymentMethod[])[i%3]:"—",
      status: uniSt[i],
      receiptNo: uniSt[i]!=="Unpaid"?`UNI-${String(i+1).padStart(3,"0")}`:"—",
    });
  });
  return fees;
};

const monthlyRevenue = [
  { month:"Apr", collected:128000, expected:180000 },
  { month:"May", collected:145000, expected:180000 },
  { month:"Jun", collected:138000, expected:180000 },
  { month:"Jul", collected:158000, expected:180000 },
  { month:"Aug", collected:162000, expected:180000 },
  { month:"Sep", collected:155000, expected:180000 },
  { month:"Oct", collected:170000, expected:180000 },
  { month:"Nov", collected:148000, expected:180000 },
  { month:"Dec", collected:92000,  expected:180000 },
  { month:"Jan", collected:164000, expected:180000 },
  { month:"Feb", collected:172000, expected:180000 },
  { month:"Mar", collected:176000, expected:180000 },
];
const revenueConfig: ChartConfig = {
  expected:  { label:"Target",    color:"#e2e8f0" },
  collected: { label:"Collected", color:"#007BFF" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers / shared UI
// ─────────────────────────────────────────────────────────────────────────────

const statusCls: Record<FeeStatus,string> = {
  Paid:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  Partial:"bg-amber-50 text-amber-700 border-amber-200",
  Unpaid: "bg-red-50 text-red-700 border-red-200",
  Waived: "bg-slate-100 text-slate-500 border-slate-200",
};
const methodCls: Record<string,string> = {
  UPI:   "bg-violet-50 text-violet-700 border-violet-200",
  NEFT:  "bg-blue-50 text-blue-700 border-blue-200",
  Cash:  "bg-slate-100 text-slate-700 border-slate-200",
  Cheque:"bg-orange-50 text-orange-700 border-orange-200",
  "—":   "bg-slate-50 text-slate-400 border-slate-100",
};

function StatusBadge({ s }: { s: FeeStatus }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusCls[s]}`}>{s}</span>;
}
function MethodBadge({ m }: { m: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${methodCls[m]??methodCls["—"]}`}>{m}</span>;
}
function StatCard({ label,value,sub,accent }: { label:string; value:string|number; sub?:string; accent?:boolean }) {
  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-4">
        <p className={`text-2xl font-bold ${accent?"text-[#007BFF]":"text-slate-900"}`}>{value}</p>
        <p className="text-[12px] text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function RecordPaymentPopover({ trigger,studentName,feeType,totalAmount,currentPaid,onRecord }: {
  trigger: React.ReactNode; studentName:string; feeType:string;
  totalAmount:number; currentPaid:number;
  onRecord:(amount:number,method:PaymentMethod,date:string)=>void;
}) {
  const [amount,setAmount]   = useState(String(totalAmount-currentPaid));
  const [method,setMethod]   = useState<PaymentMethod>("UPI");
  const [date,setDate]       = useState(new Date().toISOString().slice(0,10));
  const [open,setOpen]       = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <p className="text-[13px] font-semibold text-slate-800 mb-0.5">Record Payment</p>
        <p className="text-[11px] text-slate-400 mb-3">{studentName} · {feeType}</p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Amount (₹)</label>
            <Input className="h-8 text-[12px]" type="number" value={amount} onChange={e=>setAmount(e.target.value)}
              placeholder={`Balance: ₹${(totalAmount-currentPaid).toLocaleString()}`} />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Payment Method</label>
            <Select value={method} onValueChange={v=>setMethod(v as PaymentMethod)}>
              <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["UPI","NEFT","Cash","Cheque"] as PaymentMethod[]).map(m=>(
                  <SelectItem key={m} value={m} className="text-[12px]">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Date</label>
            <Input className="h-8 text-[12px]" type="date" value={date} onChange={e=>setDate(e.target.value)} />
          </div>
          <Button size="sm" className="w-full bg-[#007BFF] hover:bg-[#0062cc] text-[12px]"
            disabled={!amount||Number(amount)<=0}
            onClick={()=>{ onRecord(Number(amount),method,date); setOpen(false); }}>
            Record Payment
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function FeesPage() {
  const [tab,setTab]                   = useState("dashboard");
  const [classFilter,setClassFilter]   = useState("All");
  const [statusFilter,setStatusFilter] = useState("All");
  const [search,setSearch]             = useState("");

  const [admissionFees,setAdmissionFees] = useState<Record<string,AdmissionFee>>(initAdmission);
  const [monthlyData,setMonthlyData]     = useState<Record<string,MonthlyRecord>>(initMonthly);
  const [itemFees,setItemFees]           = useState<ItemFee[]>(initItemFees);

  // ── Derived stats ──
  const totalAdmissionCollected = useMemo(()=>Object.values(admissionFees).reduce((a,f)=>a+f.paid,0),[admissionFees]);
  const totalTuitionCollected   = useMemo(()=>Object.values(monthlyData).reduce((a,rec)=>a+Object.values(rec.payments).reduce((b,p)=>b+p.amount,0),0),[monthlyData]);
  const totalItemsCollected     = useMemo(()=>itemFees.reduce((a,f)=>a+f.paid,0),[itemFees]);
  const totalCollected          = totalAdmissionCollected+totalTuitionCollected+totalItemsCollected;

  const getUnpaidMonths = (studentId: string) =>
    MONTH_KEYS.filter(mk => new Date(mk+"-01") <= new Date() && !monthlyData[studentId]?.payments[mk]);

  const overdueTuition = STUDENTS.filter(s=>getUnpaidMonths(s.id).length>0).length;

  const filteredStudents = useMemo(()=>STUDENTS.filter(s=>{
    if (classFilter!=="All"&&s.class!==classFilter) return false;
    if (search&&!s.name.toLowerCase().includes(search.toLowerCase())&&!s.rollNo.includes(search)) return false;
    return true;
  }),[classFilter,search]);

  // ── Mutation handlers ──
  const recordAdmissionPayment = (studentId:string, amount:number, method:PaymentMethod, dateStr:string) => {
    setAdmissionFees(prev=>{
      const f={...prev[studentId]};
      f.paid=Math.min(f.amount,f.paid+amount);
      f.method=method; f.date=dateStr;
      f.status=f.paid>=f.amount?"Paid":f.paid>0?"Partial":"Unpaid";
      if(f.receiptNo==="—") f.receiptNo=`ADM-${studentId}`;
      return {...prev,[studentId]:f};
    });
  };
  const recordMonthlyPayment = (studentId:string, monthKey:string, amount:number, method:PaymentMethod, dateStr:string) => {
    setMonthlyData(prev=>{
      const rec={...prev[studentId],payments:{...prev[studentId].payments}};
      rec.payments[monthKey]={amount,method,date:dateStr,status:"Paid"};
      return {...prev,[studentId]:rec};
    });
  };
  const recordItemPayment = (studentId:string, type:"Books"|"Uniform", amount:number, method:PaymentMethod, dateStr:string) => {
    setItemFees(prev=>prev.map(f=>{
      if(f.studentId!==studentId||f.type!==type) return f;
      const newPaid=Math.min(f.amount,f.paid+amount);
      const status:FeeStatus=newPaid>=f.amount?"Paid":newPaid>0?"Partial":"Unpaid";
      return {...f,paid:newPaid,method,date:dateStr,status,
        receiptNo:f.receiptNo==="—"?`${type==="Books"?"BK":"UNI"}-${studentId}`:f.receiptNo};
    }));
  };

  const filteredItemFees = (type:"Books"|"Uniform") => itemFees.filter(f=>{
    const s=STUDENTS.find(st=>st.id===f.studentId)!;
    if(f.type!==type) return false;
    if(classFilter!=="All"&&s.class!==classFilter) return false;
    if(statusFilter!=="All"&&f.status!==statusFilter) return false;
    if(search&&!s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Fees & Finance" description="Admissions, tuition, books and uniforms portal" />
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs value={tab} onValueChange={setTab}>
            {/* Top nav */}
            <div className="flex items-center justify-between mb-5">
              <TabsList>
                <TabsTrigger value="dashboard" className="text-[12px] h-6">Dashboard</TabsTrigger>
                <TabsTrigger value="admissions" className="text-[12px] h-6">Admissions</TabsTrigger>
                <TabsTrigger value="tuition" className="text-[12px] h-6">Monthly Tuition</TabsTrigger>
                <TabsTrigger value="books" className="text-[12px] h-6">Books</TabsTrigger>
                <TabsTrigger value="uniforms" className="text-[12px] h-6">Uniforms</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Input className="h-8 w-44 text-[12px] bg-white" placeholder="Search student…" value={search} onChange={e=>setSearch(e.target.value)} />
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="h-8 w-32 text-[12px] bg-white"><SelectValue placeholder="Class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All" className="text-[12px]">All Classes</SelectItem>
                    {CLASSES.map(c=><SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ── DASHBOARD ── */}
            <TabsContent value="dashboard" className="mt-0">
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Total Collected (YTD)" value={`₹${(totalCollected/100000).toFixed(2)}L`} accent />
                  <StatCard label="Admission Collected"   value={`₹${(totalAdmissionCollected/1000).toFixed(1)}K`} sub={`${Object.values(admissionFees).filter(f=>f.status==="Paid").length}/${STUDENTS.length} students`} />
                  <StatCard label="Tuition Collected"     value={`₹${(totalTuitionCollected/1000).toFixed(1)}K`} sub="This session" />
                  <StatCard label="Overdue Accounts"      value={STUDENTS.filter(s=>admissionFees[s.id]?.status!=="Paid"||getUnpaidMonths(s.id).length>0).length} sub="Students with pending dues" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="shadow-none border-slate-200 col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[14px] font-semibold">Monthly Fee Collection 2025–26</CardTitle>
                      <CardDescription className="text-[12px]">All fee types combined</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={revenueConfig} className="h-[240px] w-full">
                        <BarChart data={monthlyRevenue} margin={{left:0,right:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="month" tick={{fontSize:11}} axisLine={false} tickLine={false} tickMargin={8} />
                          <YAxis tickFormatter={v=>`₹${v/1000}K`} tick={{fontSize:10}} axisLine={false} tickLine={false} width={48} />
                          <ChartTooltip content={<ChartTooltipContent formatter={v=>[`₹${Number(v).toLocaleString()}`]} />} />
                          <Bar dataKey="expected"  fill="var(--color-expected)"  radius={[3,3,0,0]} />
                          <Bar dataKey="collected" fill="var(--color-collected)" radius={[3,3,0,0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none border-slate-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[14px] font-semibold">Collection Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      {[
                        { label:"Admissions",      amount:totalAdmissionCollected, target:STUDENTS.length*ADMISSION_FEE, color:"bg-blue-500" },
                        { label:"Monthly Tuition", amount:totalTuitionCollected,   target:STUDENTS.reduce((a,s)=>a+TUITION_BY_CLASS[s.class]*8,0), color:"bg-emerald-500" },
                        { label:"Books",           amount:itemFees.filter(f=>f.type==="Books").reduce((a,f)=>a+f.paid,0),   target:STUDENTS.reduce((a,s)=>a+BOOK_FEE_BY_CLASS[s.class],0), color:"bg-violet-500" },
                        { label:"Uniforms",        amount:itemFees.filter(f=>f.type==="Uniform").reduce((a,f)=>a+f.paid,0), target:STUDENTS.length*UNIFORM_FEE, color:"bg-amber-500" },
                      ].map(item=>{
                        const pct=Math.round((item.amount/item.target)*100);
                        return (
                          <div key={item.label}>
                            <div className="flex justify-between mb-1">
                              <span className="text-[12px] text-slate-600 font-medium">{item.label}</span>
                              <span className="text-[12px] text-slate-500">₹{(item.amount/1000).toFixed(1)}K <span className="text-slate-400">/ ₹{(item.target/1000).toFixed(1)}K</span></span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${item.color} rounded-full`} style={{width:`${pct}%`}} />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>

                {/* Overdue table */}
                <Card className="shadow-none border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[14px] font-semibold">Pending / Overdue</CardTitle>
                    <CardDescription className="text-[12px]">Students with outstanding dues across any fee type</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          {["Student","Class","Admission","Unpaid Months","Books","Uniforms"].map(h=>(
                            <TableHead key={h} className={`text-[11px] font-semibold uppercase text-slate-500 ${h==="Student"?"pl-6":""}`}>{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {STUDENTS.filter(s=>{
                          const adm=admissionFees[s.id];
                          const book=itemFees.find(f=>f.studentId===s.id&&f.type==="Books");
                          const uni=itemFees.find(f=>f.studentId===s.id&&f.type==="Uniform");
                          return adm?.status!=="Paid"||getUnpaidMonths(s.id).length>0||book?.status!=="Paid"||uni?.status!=="Paid";
                        }).map(s=>{
                          const adm=admissionFees[s.id];
                          const unpaidM=getUnpaidMonths(s.id);
                          const book=itemFees.find(f=>f.studentId===s.id&&f.type==="Books");
                          const uni=itemFees.find(f=>f.studentId===s.id&&f.type==="Uniform");
                          return (
                            <TableRow key={s.id} className="hover:bg-slate-50 border-slate-100">
                              <TableCell className="pl-6">
                                <p className="text-[13px] font-medium text-slate-900">{s.name}</p>
                                <p className="text-[11px] text-slate-400">{s.rollNo}</p>
                              </TableCell>
                              <TableCell className="text-[13px] text-slate-600">{s.class} – {s.section}</TableCell>
                              <TableCell><StatusBadge s={adm?.status??"Unpaid"} /></TableCell>
                              <TableCell>
                                {unpaidM.length>0
                                  ? <span className="text-[12px] text-red-600 font-medium">{unpaidM.length} month{unpaidM.length>1?"s":""}</span>
                                  : <span className="text-[12px] text-emerald-600">Up to date</span>}
                              </TableCell>
                              <TableCell><StatusBadge s={book?.status??"Unpaid"} /></TableCell>
                              <TableCell><StatusBadge s={uni?.status??"Unpaid"} /></TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── ADMISSIONS ── */}
            <TabsContent value="admissions" className="mt-0">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-4 gap-4">
                  <StatCard label="Total Target"  value={`₹${(STUDENTS.length*ADMISSION_FEE/1000).toFixed(0)}K`} />
                  <StatCard label="Collected"     value={`₹${(totalAdmissionCollected/1000).toFixed(1)}K`} accent />
                  <StatCard label="Fully Paid"    value={Object.values(admissionFees).filter(f=>f.status==="Paid").length} />
                  <StatCard label="Outstanding"   value={Object.values(admissionFees).filter(f=>f.status!=="Paid"&&f.status!=="Waived").length} />
                </div>
                <Card className="shadow-none border-slate-200 pt-0">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          {["Student","Class","Total","Paid","Balance","Date","Method","Status","Receipt",""].map((h,idx)=>(
                            <TableHead key={idx} className={`text-[11px] font-semibold uppercase text-slate-500 ${h==="Student"?"pl-6":""}`}>{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map(s=>{
                          const f=admissionFees[s.id];
                          const balance=f.amount-f.paid;
                          return (
                            <TableRow key={s.id} className="hover:bg-slate-50 border-slate-100">
                              <TableCell className="pl-6">
                                <p className="text-[13px] font-medium text-slate-900">{s.name}</p>
                                <p className="text-[11px] text-slate-400">{s.rollNo}</p>
                              </TableCell>
                              <TableCell className="text-[13px] text-slate-600">{s.class}</TableCell>
                              <TableCell className="text-[13px] text-slate-700">₹{f.amount.toLocaleString()}</TableCell>
                              <TableCell className="text-[13px] font-medium text-emerald-700">₹{f.paid.toLocaleString()}</TableCell>
                              <TableCell className={`text-[13px] font-medium ${balance>0?"text-red-600":"text-slate-400"}`}>
                                {balance>0?`₹${balance.toLocaleString()}`:"—"}
                              </TableCell>
                              <TableCell className="text-[13px] text-slate-500">{f.date}</TableCell>
                              <TableCell><MethodBadge m={f.method} /></TableCell>
                              <TableCell><StatusBadge s={f.status} /></TableCell>
                              <TableCell className="text-[12px] text-slate-400 font-mono">{f.receiptNo}</TableCell>
                              <TableCell className="pr-4">
                                {f.status!=="Paid"&&f.status!=="Waived"&&(
                                  <RecordPaymentPopover
                                    trigger={<Button size="sm" variant="outline" className="h-7 text-[11px] border-[#007BFF] text-[#007BFF] hover:bg-blue-50">Record</Button>}
                                    studentName={s.name} feeType="Admission Fee"
                                    totalAmount={f.amount} currentPaid={f.paid}
                                    onRecord={(amt,method,date)=>recordAdmissionPayment(s.id,amt,method,date)}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── MONTHLY TUITION ── */}
            <TabsContent value="tuition" className="mt-0">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-4 gap-4">
                  <StatCard label="Tuition Collected" value={`₹${(totalTuitionCollected/1000).toFixed(1)}K`} accent />
                  <StatCard label="Students Overdue"  value={overdueTuition} />
                  <StatCard label="Session"           value="2025–26" />
                  <StatCard label="Monthly Target"    value={`₹${(STUDENTS.reduce((a,s)=>a+TUITION_BY_CLASS[s.class],0)/1000).toFixed(1)}K`} />
                </div>
                <Card className="shadow-none border-slate-200 overflow-x-auto pt-0">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="pl-6 text-[11px] font-semibold uppercase text-slate-500 sticky left-0 bg-slate-50 z-10 min-w-[160px]">Student</TableHead>
                          <TableHead className="text-[11px] font-semibold uppercase text-slate-500 min-w-[80px]">Class</TableHead>
                          <TableHead className="text-[11px] font-semibold uppercase text-slate-500 min-w-[70px]">Monthly</TableHead>
                          {MONTHS.map(m=>(
                            <TableHead key={m} className="text-[11px] font-semibold uppercase text-slate-500 text-center min-w-[54px]">{m}</TableHead>
                          ))}
                          <TableHead className="text-[11px] font-semibold uppercase text-slate-500 pr-4 min-w-[80px]">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map(s=>{
                          const rec=monthlyData[s.id]??{studentId:s.id,payments:{}};
                          const unpaidMonths=getUnpaidMonths(s.id);
                          return (
                            <TableRow key={s.id} className="hover:bg-slate-50 border-slate-100">
                              <TableCell className="pl-6 sticky left-0 bg-white z-10">
                                <p className="text-[13px] font-medium text-slate-900">{s.name}</p>
                                <p className="text-[11px] text-slate-400">{s.rollNo}</p>
                              </TableCell>
                              <TableCell className="text-[13px] text-slate-600">{s.class}</TableCell>
                              <TableCell className="text-[13px] text-slate-700 font-medium">₹{TUITION_BY_CLASS[s.class].toLocaleString()}</TableCell>
                              {MONTH_KEYS.map(mk=>{
                                const p=rec.payments[mk];
                                const isFuture=new Date(mk+"-01")>new Date();
                                return (
                                  <TableCell key={mk} className="text-center px-1">
                                    {isFuture?(
                                      <span className="text-[10px] text-slate-300">—</span>
                                    ):p?(
                                      <span title={`${p.method} · ${p.date}`} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="2,5 4.2,7.5 8,2.5"/></svg>
                                      </span>
                                    ):(
                                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-400">
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/></svg>
                                      </span>
                                    )}
                                  </TableCell>
                                );
                              })}
                              <TableCell className="pr-4">
                                {unpaidMonths.length>0&&(
                                  <RecordPaymentPopover
                                    trigger={<Button size="sm" variant="outline" className="h-7 text-[11px] border-[#007BFF] text-[#007BFF] hover:bg-blue-50 whitespace-nowrap">Pay ({unpaidMonths.length})</Button>}
                                    studentName={s.name}
                                    feeType={`Tuition – ${unpaidMonths.length} month${unpaidMonths.length>1?"s":""}`}
                                    totalAmount={TUITION_BY_CLASS[s.class]*unpaidMonths.length}
                                    currentPaid={0}
                                    onRecord={(amt,method,date)=>{
                                      let remaining=amt;
                                      for(const mk of unpaidMonths){
                                        if(remaining<=0) break;
                                        const mAmt=Math.min(TUITION_BY_CLASS[s.class],remaining);
                                        recordMonthlyPayment(s.id,mk,mAmt,method,date);
                                        remaining-=mAmt;
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
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── BOOKS ── */}
            <TabsContent value="books" className="mt-0">
              <ItemFeeTab label="Books" type="Books" items={filteredItemFees("Books")}
                students={STUDENTS} statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                onRecord={(sid,amt,method,date)=>recordItemPayment(sid,"Books",amt,method,date)} />
            </TabsContent>

            {/* ── UNIFORMS ── */}
            <TabsContent value="uniforms" className="mt-0">
              <ItemFeeTab label="Uniforms" type="Uniform" items={filteredItemFees("Uniform")}
                students={STUDENTS} statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                onRecord={(sid,amt,method,date)=>recordItemPayment(sid,"Uniform",amt,method,date)} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Item Fee Tab (shared for Books & Uniforms)
// ─────────────────────────────────────────────────────────────────────────────

function ItemFeeTab({ label,type,items,students,statusFilter,setStatusFilter,onRecord }: {
  label:string; type:"Books"|"Uniform"; items:ItemFee[]; students:Student[];
  statusFilter:string; setStatusFilter:(v:string)=>void;
  onRecord:(studentId:string,amount:number,method:PaymentMethod,date:string)=>void;
}) {
  const totalCollected = items.reduce((a,f)=>a+f.paid,0);
  const totalExpected  = items.reduce((a,f)=>a+f.amount,0);
  const filtered = statusFilter==="All" ? items : items.filter(f=>f.status===statusFilter);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label={`${label} Collected`} value={`₹${(totalCollected/1000).toFixed(1)}K`} accent />
        <StatCard label="Total Expected"       value={`₹${(totalExpected/1000).toFixed(1)}K`} />
        <StatCard label="Fully Paid"           value={items.filter(f=>f.status==="Paid").length} />
        <StatCard label="Outstanding"          value={items.filter(f=>f.status!=="Paid"&&f.status!=="Waived").length} />
      </div>
      <Card className="shadow-none border-slate-200 pt-0">
        <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-slate-100">
          <span className="text-[12px] text-slate-500 font-medium">Filter:</span>
          {(["All","Paid","Partial","Unpaid"] as const).map(v=>(
            <button key={v} onClick={()=>setStatusFilter(v)}
              className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold transition-all ${
                statusFilter===v?"bg-[#007BFF] text-white border-[#007BFF]":"border-slate-200 text-slate-500 hover:border-slate-300"
              }`}>
              {v}
            </button>
          ))}
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                {["Student","Class","Description","Amount","Paid","Balance","Date","Method","Status","Receipt",""].map((h,idx)=>(
                  <TableHead key={idx} className={`text-[11px] font-semibold uppercase text-slate-500 ${h==="Student"?"pl-6":""}`}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(f=>{
                const s=students.find(st=>st.id===f.studentId)!;
                const balance=f.amount-f.paid;
                return (
                  <TableRow key={f.studentId+f.type} className="hover:bg-slate-50 border-slate-100">
                    <TableCell className="pl-6">
                      <p className="text-[13px] font-medium text-slate-900">{s?.name}</p>
                      <p className="text-[11px] text-slate-400">{s?.rollNo}</p>
                    </TableCell>
                    <TableCell className="text-[13px] text-slate-600">{s?.class}</TableCell>
                    <TableCell className="text-[13px] text-slate-500 max-w-[180px] truncate">{f.description}</TableCell>
                    <TableCell className="text-[13px] text-slate-700">₹{f.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-[13px] font-medium text-emerald-700">₹{f.paid.toLocaleString()}</TableCell>
                    <TableCell className={`text-[13px] font-medium ${balance>0?"text-red-600":"text-slate-400"}`}>
                      {balance>0?`₹${balance.toLocaleString()}`:"—"}
                    </TableCell>
                    <TableCell className="text-[13px] text-slate-500">{f.date}</TableCell>
                    <TableCell><MethodBadge m={f.method} /></TableCell>
                    <TableCell><StatusBadge s={f.status} /></TableCell>
                    <TableCell className="text-[12px] text-slate-400 font-mono">{f.receiptNo}</TableCell>
                    <TableCell className="pr-4">
                      {f.status!=="Paid"&&f.status!=="Waived"&&(
                        <RecordPaymentPopover
                          trigger={<Button size="sm" variant="outline" className="h-7 text-[11px] border-[#007BFF] text-[#007BFF] hover:bg-blue-50">Record</Button>}
                          studentName={s?.name??""} feeType={`${type} Fee`}
                          totalAmount={f.amount} currentPaid={f.paid}
                          onRecord={(amt,method,date)=>onRecord(f.studentId,amt,method,date)}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
