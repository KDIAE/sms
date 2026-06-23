"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Student, ClassFeeStructure } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PaymentMethod = "UPI" | "NEFT" | "Cash" | "Cheque";
export type FeeTypeOption = "Admission" | "Registration" | "Annual" | "Monthly Tuition" | "Transport" | "Uniform" | "Books";

// ── Badge helpers ─────────────────────────────────────────────────────────────

export const statusCls: Record<string, string> = {
  Paid:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
  Unpaid:  "bg-red-50 text-red-700 border-red-200",
  Waived:  "bg-slate-100 text-slate-500 border-slate-200",
};

export const methodCls: Record<string, string> = {
  UPI:    "bg-violet-50 text-violet-700 border-violet-200",
  NEFT:   "bg-blue-50 text-blue-700 border-blue-200",
  Cash:   "bg-slate-100 text-slate-700 border-slate-200",
  Cheque: "bg-orange-50 text-orange-700 border-orange-200",
  "—":    "bg-slate-50 text-slate-400 border-slate-100",
};

export function StatusBadge({ s }: { s: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusCls[s] ?? statusCls["Unpaid"]}`}>
      {s}
    </span>
  );
}

export function MethodBadge({ m }: { m: string | null }) {
  const label = m ?? "—";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${methodCls[label] ?? methodCls["—"]}`}>
      {label}
    </span>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

export function StatCard({ label, value, sub, accent }: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
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

// ── RecordPaymentPopover ──────────────────────────────────────────────────────

export function RecordPaymentPopover({
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

// ── LogFeeDialog ──────────────────────────────────────────────────────────────

export function LogFeeDialog({ open, onClose, monthKeys, monthLabels, students, feeStructures, onRecord }: {
  open: boolean;
  onClose: () => void;
  monthKeys: string[];
  monthLabels: string[];
  students: Student[];
  feeStructures: ClassFeeStructure[];
  onRecord: (
    studentId: string, feeType: FeeTypeOption, monthKey: string | null,
    amount: number, method: PaymentMethod, date: string,
  ) => Promise<void>;
}) {
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const [studentId, setStudentId] = useState("");
  const [studentOpen, setStudentOpen] = useState(false);
  const [feeType,   setFeeType]   = useState<FeeTypeOption>("Monthly Tuition");
  const [monthKey,  setMonthKey]  = useState<string>(monthKeys.includes(currentMonthKey) ? currentMonthKey : (monthKeys[0] ?? ""));
  const [amount,    setAmount]    = useState("");
  const [method,    setMethod]    = useState<PaymentMethod>("UPI");
  const [date,      setDate]      = useState(new Date().toISOString().slice(0, 10));
  const [loading,   setLoading]   = useState(false);

  // Group students by class for the combobox
  const studentsByClass = students.reduce<Record<string, Student[]>>((acc, s) => {
    const cls = s.class_name || "Unassigned";
    (acc[cls] ??= []).push(s);
    return acc;
  }, {});
  const classGroups = Object.keys(studentsByClass).sort();

  // Auto-fill amount when student or fee type changes
  const selectedStudent = students.find(s => s.id === studentId);
  useEffect(() => {
    if (!selectedStudent) return;
    const struct = feeStructures.find(f => f.class_name === selectedStudent.class_name);
    if (!struct) return;
    const map: Partial<Record<FeeTypeOption, number>> = {
      "Admission":      struct.admission_fee,
      "Registration":   struct.registration_fee,
      "Annual":         struct.annual_fee,
      "Monthly Tuition": struct.tuition_fee,
      "Transport":      struct.transport_fee,
      "Uniform":        struct.uniform_fee,
    };
    const val = map[feeType];
    setAmount(val && val > 0 ? String(val) : "");
  }, [studentId, feeType, feeStructures]);

  const handleSubmit = async () => {
    if (!studentId || !amount || Number(amount) <= 0) return;
    setLoading(true);
    try {
      await onRecord(studentId, feeType, (feeType === "Monthly Tuition" || feeType === "Transport") ? monthKey : null, Number(amount), method, date);
      setStudentId(""); setFeeType("Monthly Tuition"); setAmount(""); setMethod("UPI");
      setDate(new Date().toISOString().slice(0, 10));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const structForStudent = selectedStudent
    ? feeStructures.find(f => f.class_name === selectedStudent.class_name)
    : undefined;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Log Fee Payment</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-1">
          {/* Student combobox with search, grouped by class */}
          <div className="col-span-2">
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Student</label>
            <Popover open={studentOpen} onOpenChange={setStudentOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={studentOpen}
                  className="w-full h-9 justify-between text-[12px] font-normal"
                >
                  {studentId
                    ? (() => { const s = students.find(x => x.id === studentId); return s ? `${s.name}${s.roll_no ? ` · ${s.roll_no}` : ""} (${s.class_name ?? ""})` : "Select student…"; })()
                    : "Select student…"}
                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[420px] p-0 overflow-hidden" align="start">
                <Command className="overflow-visible">
                  <CommandInput placeholder="Search by name or roll no…" className="text-[12px] h-9" />
                  <CommandList className="max-h-56 overflow-y-auto">
                    <CommandEmpty className="py-4 text-center text-[12px] text-slate-400">No students found.</CommandEmpty>
                    {classGroups.map(cls => (
                      <CommandGroup key={cls} heading={cls}>
                        {(studentsByClass[cls] ?? []).map(s => (
                          <CommandItem
                            key={s.id}
                            value={`${s.name} ${s.roll_no ?? ""} ${cls}`}
                            onSelect={() => { setStudentId(s.id); setStudentOpen(false); }}
                            className="text-[12px]"
                          >
                            <Check className={cn("mr-2 h-3.5 w-3.5", studentId === s.id ? "opacity-100" : "opacity-0")} />
                            {s.name}{s.roll_no ? <span className="text-slate-400 ml-1.5">· {s.roll_no}</span> : null}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Fee Type</label>
            <Select value={feeType} onValueChange={v => setFeeType(v as FeeTypeOption)}>
              <SelectTrigger className="h-9 w-full text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["Admission", "Registration", "Annual", "Monthly Tuition", "Transport", "Uniform", "Books"] as FeeTypeOption[]).map(t => (
                  <SelectItem key={t} value={t} className="text-[12px]">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(feeType === "Monthly Tuition" || feeType === "Transport") && monthKeys.length > 0 ? (
            <div>
              <label className="text-[11px] text-slate-500 font-medium mb-1 block">Month</label>
              <Select value={monthKey} onValueChange={setMonthKey}>
                <SelectTrigger className="h-9 w-full text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {monthKeys.map((mk, i) => (
                    <SelectItem key={mk} value={mk} className="text-[12px]">{monthLabels[i]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : <div />}
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">
              Amount (₹)
              {structForStudent && (["Admission", "Registration", "Annual", "Monthly Tuition", "Transport", "Uniform"] as FeeTypeOption[]).includes(feeType) && (
                <span className="ml-1.5 text-[10px] text-[#007BFF] font-normal">auto-filled from structure</span>
              )}
            </label>
            <Input className="h-9 w-full text-[12px]" type="number" min={1} value={amount}
              onChange={e => setAmount(e.target.value)} placeholder="Enter amount" />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Payment Method</label>
            <Select value={method} onValueChange={v => setMethod(v as PaymentMethod)}>
              <SelectTrigger className="h-9 w-full text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["UPI", "NEFT", "Cash", "Cheque"] as PaymentMethod[]).map(m => (
                  <SelectItem key={m} value={m} className="text-[12px]">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <label className="text-[11px] text-slate-500 font-medium mb-1 block">Date</label>
            <Input className="h-9 w-full text-[12px]" type="date" value={date} onChange={e => setDate(e.target.value)} />
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
