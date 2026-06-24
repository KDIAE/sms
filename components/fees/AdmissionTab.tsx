"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SmsAdmissionFeeRow } from "@/lib/api";
import { StatCard, StatusBadge, MethodBadge, RecordPaymentPopover, type PaymentMethod } from "./shared";

export function AdmissionTab({ rows, loading, onRecord }: {
  rows: SmsAdmissionFeeRow[];
  loading: boolean;
  onRecord: (sid: string, amt: number, method: PaymentMethod, date: string) => void;
}) {
  const totalCollected = rows.reduce((a, r) => a + r.paid, 0);
  const totalTarget    = rows.reduce((a, r) => a + r.total, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Target"  value={`₹${(totalTarget / 1000).toFixed(0)}K`} />
        <StatCard label="Collected"     value={`₹${(totalCollected / 1000).toFixed(1)}K`} accent />
        <StatCard label="Fully Paid"    value={rows.filter(r => r.status === "Paid").length} />
        <StatCard label="Outstanding"   value={rows.filter(r => r.status !== "Paid" && r.status !== "Waived").length} />
      </div>
      <Card className="shadow-none border-slate-200 pt-0 overflow-x-auto">
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
                  {["Student", "Class", "Total", "Paid", "Balance", "Date", "Method", "Status", "Receipt", ""].map((h, i) => (
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
