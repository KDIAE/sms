"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SmsItemFeeRow } from "@/lib/api";
import { StatCard, StatusBadge, MethodBadge, RecordPaymentPopover, type PaymentMethod } from "./shared";

export function ItemTab({ label, rows, loading, statusFilter, setStatusFilter, onRecord }: {
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label={`${label} Collected`} value={`₹${(totalCollected / 1000).toFixed(1)}K`} accent />
        <StatCard label="Total Expected"       value={`₹${(totalExpected / 1000).toFixed(1)}K`} />
        <StatCard label="Fully Paid"           value={rows.filter(r => r.status === "Paid").length} />
        <StatCard label="Outstanding"          value={rows.filter(r => r.status !== "Paid" && r.status !== "Waived").length} />
      </div>
      <Card className="shadow-none border-slate-200 pt-0 overflow-x-auto">
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
                  {["Student", "Class", "Description", "Amount", "Paid", "Balance", "Date", "Method", "Status", "Receipt", ""].map((h, i) => (
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
