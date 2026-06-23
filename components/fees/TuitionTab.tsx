"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SmsTuitionRow } from "@/lib/api";
import { StatCard, RecordPaymentPopover, type PaymentMethod } from "./shared";

export function TuitionTab({ rows, loading, monthKeys, monthLabels, onRecord }: {
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
