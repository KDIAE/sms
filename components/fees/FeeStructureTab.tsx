"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { smsFeesApi, type ClassFeeStructure } from "@/lib/api";

export function FeeStructureTab({ structures, loading, onSaved }: {
  structures: ClassFeeStructure[];
  loading: boolean;
  onSaved: (updated: ClassFeeStructure) => void;
}) {
  const [editing, setEditing] = useState<Record<string, ClassFeeStructure>>({});
  const [saving,  setSaving]  = useState<string | null>(null);

  const getVal = (className: string, field: keyof Omit<ClassFeeStructure, "class_name">, fallback: number) =>
    editing[className]?.[field] ?? fallback;

  const handleChange = (className: string, field: keyof Omit<ClassFeeStructure, "class_name">, value: string) => {
    const orig = structures.find(s => s.class_name === className) ?? { class_name: className, admission_fee: 0, registration_fee: 0, annual_fee: 0, tuition_fee: 0, transport_fee: 0, uniform_fee: 0 };
    setEditing(p => ({ ...p, [className]: { ...orig, ...p[className], [field]: Number(value) } }));
  };

  const handleSave = async (className: string) => {
    const orig = structures.find(s => s.class_name === className) ?? { class_name: className, admission_fee: 0, registration_fee: 0, annual_fee: 0, tuition_fee: 0, transport_fee: 0, uniform_fee: 0 };
    const data = { ...orig, ...editing[className] };
    setSaving(className);
    try {
      const updated = await smsFeesApi.upsertStructure(className, {
        admission_fee:    data.admission_fee,
        registration_fee: data.registration_fee,
        annual_fee:       data.annual_fee,
        tuition_fee:      data.tuition_fee,
        transport_fee:    data.transport_fee,
        uniform_fee:      data.uniform_fee,
      });
      onSaved(updated);
      setEditing(p => { const next = { ...p }; delete next[className]; return next; });
    } finally {
      setSaving(null);
    }
  };

  const isDirty = (className: string) => className in editing;

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-none border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-[14px] font-semibold">Class Fee Structure</CardTitle>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Set fee amounts per class. These amounts auto-fill when logging payments.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="px-6 pb-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : structures.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <p className="text-[13px]">No classes found. Add classes first.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="pl-6 text-[11px] font-semibold uppercase text-slate-500">Class</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase text-slate-500">Admission (₹)</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase text-slate-500">Registration (₹)</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase text-slate-500">Annual (₹)</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase text-slate-500">Monthly Tuition (₹)</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase text-slate-500">Transport / mo (₹)</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase text-slate-500">Uniform (₹)</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase text-slate-500 pr-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {structures.map(s => (
                  <TableRow key={s.class_name} className={`border-slate-100 ${isDirty(s.class_name) ? "bg-blue-50/30" : "hover:bg-slate-50"}`}>
                    <TableCell className="pl-6 text-[13px] font-semibold text-slate-800">{s.class_name}</TableCell>
                    {(["admission_fee", "registration_fee", "annual_fee", "tuition_fee", "transport_fee", "uniform_fee"] as const).map(field => (
                      <TableCell key={field}>
                        <Input
                          type="number"
                          min={0}
                          className="h-8 w-32 text-[12px] bg-white"
                          value={getVal(s.class_name, field, s[field])}
                          onChange={e => handleChange(s.class_name, field, e.target.value)}
                        />
                      </TableCell>
                    ))}
                    <TableCell className="pr-6 text-right">
                      <Button
                        size="sm"
                        className={`h-7 text-[11px] ${isDirty(s.class_name) ? "bg-[#007BFF] hover:bg-[#0062cc] text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                        disabled={saving === s.class_name}
                        onClick={() => handleSave(s.class_name)}
                      >
                        {saving === s.class_name ? "Saving…" : "Save"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
