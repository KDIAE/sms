"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faFileLines, faUsers, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { studentsApi, type Student } from "@/lib/api";
import { LField } from "@/components/form/LField";
import { LDatePicker } from "@/components/form/LDatePicker";
import { LSelect } from "@/components/form/LSelect";
import { FileField } from "@/components/form/FileField";
import { BLOOD_GROUPS, ID_TYPES, RELATIONS, FEE_STATUS, SECTIONS } from "@/components/form/constants";
import { useAuth } from "@/lib/auth-context";

export function StudentExpandPanel({
  s, onClose, classesList, onUpdated, mobile = false, existingCodes = [],
}: {
  s: Student;
  onClose: () => void;
  classesList: string[];
  onUpdated: (updated: Student) => void;
  mobile?: boolean;
  existingCodes?: string[];
}) {
  const { user } = useAuth();
  const isPrincipal = user?.role === "principal";

  const [draft, setDraft] = useState<Student>({ ...s });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set    = (f: string, v: string) => setDraft((p) => ({ ...p, [f]: v }));
  const setG   = (f: string, v: string) => setDraft((p) => ({ ...p, guardian:  { ...p.guardian,  [f]: v } }));
  const setG2  = (f: string, v: string) => setDraft((p) => ({ ...p, guardian2: { ...p.guardian2, [f]: v } }));
  const setFees = (f: string, v: string | number) => setDraft((p) => ({ ...p, fees: { ...p.fees, [f]: v } }));

  const isDuplicateCode =
    draft.student_code.trim() !== "" &&
    draft.student_code !== s.student_code &&
    existingCodes.includes(draft.student_code.trim());

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const { id, ...rest } = draft;
      const updated = await studentsApi.update(id, rest);
      onUpdated(updated);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <div className="flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>

          {/* Student Information */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="text-[#007BFF]" /> Student Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="sm:col-span-2 xl:col-span-2">
                <LField label="Full Name" field="name" value={draft.name} onChange={set} />
              </div>
              <LField      label="Student UID"     field="student_code"   value={draft.student_code}  onChange={set} error={isDuplicateCode ? "This UID is already taken" : undefined} />
              <LField      label="Roll No."        field="roll_no"        value={draft.roll_no}       onChange={set} />
              <LDatePicker label="Date of Birth"   field="dob"            value={draft.dob}           onChange={set} />
              <LSelect     label="Gender"         field="gender"         value={draft.gender}        options={["Male","Female","Other"]} onChange={set} />
              <LSelect     label="Blood Group"    field="blood_group"    value={draft.blood_group}   options={BLOOD_GROUPS} onChange={set} />
              <LSelect     label="Class"          field="class_name"     value={draft.class_name}    options={classesList} onChange={set} />
              <LSelect     label="Section"        field="section"        value={draft.section}       options={SECTIONS} onChange={set} />
              <LField      label="Phone"          field="phone" type="tel"          value={draft.phone}         onChange={set} />
              <LField      label="Email"          field="email" type="email"          value={draft.email}         onChange={set} />
              <LDatePicker label="Admission Date" field="admission_date" value={draft.admission_date} onChange={set} />
              {!isPrincipal && (
                <>
                  <div className="sm:col-span-2 xl:col-span-4"><Separator className="my-1" /></div>
                  <p className="sm:col-span-2 xl:col-span-4 text-[11px] font-bold text-slate-400 uppercase">Fee Information</p>
                  <LField label="Tuition Fee (₹/mo)"     field="tuition_fee"        value={String(draft.fees.tuition_fee)}        onChange={(_, v) => setFees("tuition_fee", Number(v))} />
                  <LField label="Concession Amount (₹)"  field="concession_amount"  value={String(draft.fees.concession_amount)}  onChange={(_, v) => setFees("concession_amount", Number(v))} />
                  <LField label="Concession Reason"      field="concession_reason"  value={draft.fees.concession_reason}         onChange={(_, v) => setFees("concession_reason", v)} />
                  <LField label="Transport Fee (₹/mo)"   field="transport_fee"      value={String(draft.fees.transport_fee)}      onChange={(_, v) => setFees("transport_fee", Number(v))} />
                  <LField label="Other Monthly Fee (₹)"  field="other_monthly_fee"  value={String(draft.fees.other_monthly_fee)}  onChange={(_, v) => setFees("other_monthly_fee", Number(v))} />
                  <LField label="Admission Fee (₹)"      field="admission_fee"      value={String(draft.fees.admission_fee)}      onChange={(_, v) => setFees("admission_fee", Number(v))} />
                  <LField label="Admission Fee Paid (₹)" field="admission_fee_paid" value={String(draft.fees.admission_fee_paid)} onChange={(_, v) => setFees("admission_fee_paid", Number(v))} />
                  <LField label="Book Fee (₹)"           field="book_fee"           value={String(draft.fees.book_fee)}           onChange={(_, v) => setFees("book_fee", Number(v))} />
                  <LField label="Book Fee Paid (₹)"      field="book_fee_paid"      value={String(draft.fees.book_fee_paid)}      onChange={(_, v) => setFees("book_fee_paid", Number(v))} />
                  <LField label="Uniform Fee (₹)"        field="uniform_fee"        value={String(draft.fees.uniform_fee)}        onChange={(_, v) => setFees("uniform_fee", Number(v))} />
                  <LField label="Uniform Fee Paid (₹)"   field="uniform_fee_paid"   value={String(draft.fees.uniform_fee_paid)}   onChange={(_, v) => setFees("uniform_fee_paid", Number(v))} />
                  <LSelect label="Fee Status"            field="fee_status"         value={draft.fees.fee_status}                options={FEE_STATUS} onChange={(_, v) => setFees("fee_status", v)} />
                </>
              )}
              <div className="sm:col-span-2 xl:col-span-4">
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Address</label>
                <Input value={draft.address} onChange={(e) => set("address", e.target.value)}
                  className="h-8 text-[12px] bg-white border-slate-200" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Documents */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faFileLines} className="text-[#007BFF]" /> Documents &amp; Certificates
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="sm:col-span-2 xl:col-span-2">
                <LField label="Previous School" field="previous_school" value={draft.previous_school} onChange={set} />
              </div>
              <LField  label="TC Number"         field="tc_number"         value={draft.tc_number}         onChange={set} />
              <LField  label="CC Number"         field="cc_number"         value={draft.cc_number}         onChange={set} />
              <LSelect label="Student ID Type"   field="student_id_type"   value={draft.student_id_type}   options={ID_TYPES} onChange={set} />
              <LField  label="Student ID Number" field="student_id_number" value={draft.student_id_number} onChange={set} />
              <FileField label="Replace Transfer Certificate"  accept=".pdf,image/*" />
              <FileField label="Replace Character Certificate" accept=".pdf,image/*" />
              <FileField label="Replace Student ID Proof"      accept=".pdf,image/*" />
              <FileField label="Replace Student Photo"         accept="image/*" />
            </div>
          </div>

          <Separator />

          {/* Guardians */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faUsers} className="text-[#007BFF]" /> Guardian / Parent Information
            </p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-5">
              {/* Primary */}
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-bold text-slate-500">Primary Guardian</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LField  label="Name"       field="name"       value={draft.guardian.name}       onChange={(_, v) => setG("name", v)} />
                  <LSelect label="Relation"   field="relation"   value={draft.guardian.relation}   options={RELATIONS} onChange={(_, v) => setG("relation", v)} />
                  <LField  label="Phone"      field="phone" type="tel"      value={draft.guardian.phone}      onChange={(_, v) => setG("phone", v)} />
                  <LField  label="Email"      field="email" type="email"      value={draft.guardian.email}      onChange={(_, v) => setG("email", v)} />
                  <LField  label="Occupation" field="occupation" value={draft.guardian.occupation} onChange={(_, v) => setG("occupation", v)} />
                  <div />
                  <LSelect label="ID Type"    field="id_type"    value={draft.guardian.id_type}    options={ID_TYPES} onChange={(_, v) => setG("id_type", v)} />
                  <LField  label="ID Number"  field="id_number"  value={draft.guardian.id_number}  onChange={(_, v) => setG("id_number", v)} />
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Address (if different)</label>
                    <Input value={draft.guardian.address} onChange={(e) => setG("address", e.target.value)}
                      className="h-8 text-[12px] bg-white border-slate-200" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FileField label="Replace Guardian Photo"    accept="image/*" />
                  <FileField label="Replace Guardian ID Proof" accept=".pdf,image/*" />
                </div>
              </div>
              {/* Secondary */}
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-bold text-slate-500">Secondary Guardian <span className="text-slate-400 font-normal">(optional)</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LField  label="Name"      field="name"      value={draft.guardian2.name}      onChange={(_, v) => setG2("name", v)} />
                  <LSelect label="Relation"  field="relation"  value={draft.guardian2.relation}  options={RELATIONS} onChange={(_, v) => setG2("relation", v)} />
                  <LField  label="Phone"     field="phone" type="tel"     value={draft.guardian2.phone}     onChange={(_, v) => setG2("phone", v)} />
                  <LField  label="Email"     field="email" type="email"     value={draft.guardian2.email}     onChange={(_, v) => setG2("email", v)} />
                  <LSelect label="ID Type"   field="id_type"   value={draft.guardian2.id_type}   options={ID_TYPES} onChange={(_, v) => setG2("id_type", v)} />
                  <LField  label="ID Number" field="id_number" value={draft.guardian2.id_number} onChange={(_, v) => setG2("id_number", v)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FileField label="Replace Guardian 2 Photo"    accept="image/*" />
                  <FileField label="Replace Guardian 2 ID Proof" accept=".pdf,image/*" />
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5">{error}</p>}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <Button variant="outline" size="sm" className="h-8 sm:h-7 text-[12px] w-full sm:w-auto" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button size="sm" className="h-8 sm:h-7 text-[12px] bg-[#007BFF] hover:bg-[#0069d9] text-white w-full sm:w-auto" onClick={handleSave} disabled={saving}>
              {saving ? <><FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />Saving…</> : "Save Changes"}
            </Button>
          </div>

    </div>
  );

  if (mobile) {
    return <div className="border-t border-slate-100 p-3 bg-slate-50/70">{content}</div>;
  }

  return (
    <TableRow className="bg-slate-50/80 border-slate-100">
      <TableCell colSpan={9} className="px-6 py-5">
        {content}
      </TableCell>
    </TableRow>
  );
}
