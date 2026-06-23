"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { studentsApi, type Student } from "@/lib/api";
import { LField } from "@/components/form/LField";
import { LDatePicker } from "@/components/form/LDatePicker";
import { LSelect } from "@/components/form/LSelect";
import { FileField } from "@/components/form/FileField";
import { PhotoField } from "@/components/form/PhotoField";
import { BLOOD_GROUPS, ID_TYPES, RELATIONS, FEE_STATUS, SECTIONS } from "@/components/form/constants";
import { StepperHeader, STEPS } from "./StepperHeader";
import { BLANK_WIZARD, BLANK_FEES, BLANK_GUARDIAN, BLANK_GUARDIAN2 } from "./constants";

export function AddStudentWizard({
  open, onClose, classesList, onCreated,
}: {
  open: boolean;
  onClose: () => void;
  classesList: string[];
  onCreated: (s: Student) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...BLANK_WIZARD, fees: { ...BLANK_FEES }, guardian: { ...BLANK_GUARDIAN }, guardian2: { ...BLANK_GUARDIAN2 } });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set    = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));
  const setG   = (f: string, v: string) => setForm((p) => ({ ...p, guardian:  { ...p.guardian,  [f]: v } }));
  const setG2  = (f: string, v: string) => setForm((p) => ({ ...p, guardian2: { ...p.guardian2, [f]: v } }));
  const setFees = (f: string, v: string | number) => setForm((p) => ({ ...p, fees: { ...p.fees, [f]: v } }));

  const handleClose = () => {
    setStep(0);
    setForm({ ...BLANK_WIZARD, fees: { ...BLANK_FEES }, guardian: { ...BLANK_GUARDIAN }, guardian2: { ...BLANK_GUARDIAN2 } });
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Student name is required."); return; }
    setSaving(true); setError("");
    try {
      const created = await studentsApi.create(form);
      onCreated(created);
      handleClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save student.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="!max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        <div className="px-6 pt-6 pb-0 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">Add New Student</DialogTitle>
          </DialogHeader>
          <Separator className="my-3" />
          <StepperHeader step={step} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-2">
          {/* Step 0 — Student Info */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="col-span-2">
                <LField label="Full Name" field="name" value={form.name} onChange={set} placeholder="e.g. Priya Chatterjee" />
              </div>
              <LDatePicker label="Date of Birth"    field="dob"            value={form.dob}            onChange={set} />
              <LSelect     label="Gender"           field="gender"         value={form.gender}         options={["Male","Female","Other"]} onChange={set} />
              <LSelect     label="Blood Group"      field="blood_group"    value={form.blood_group}    options={BLOOD_GROUPS} onChange={set} />
              <LSelect     label="Class"            field="class_name"     value={form.class_name}     options={classesList} onChange={set} />
              <LSelect     label="Section"          field="section"        value={form.section}        options={SECTIONS} onChange={set} />
              <LField      label="Roll No."         field="roll_no"        value={form.roll_no}        onChange={set} placeholder="e.g. 01" />
              <LDatePicker label="Admission Date"   field="admission_date" value={form.admission_date} onChange={set} />
              <LField      label="Contact Phone"    field="phone" type="tel"          value={form.phone}          onChange={set} placeholder="98300-XXXXX" />
              <LField      label="Email (optional)" field="email" type="email"          value={form.email}          onChange={set} />
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Address</label>
                <textarea rows={2} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Full residential address" value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div className="col-span-2"><PhotoField label="Student Photo" accept="image/*" /></div>
            </div>
          )}

          {/* Step 1 — Documents & Fees */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="col-span-2">
                <LField label="Previous School" field="previous_school" value={form.previous_school} onChange={set} placeholder="Name of last attended school" />
              </div>
              <LField  label="Transfer Certificate No."  field="tc_number"         value={form.tc_number}         onChange={set} placeholder="TC/2024/001" />
              <LField  label="Character Certificate No." field="cc_number"         value={form.cc_number}         onChange={set} placeholder="CC/2024/001" />
              <LSelect label="Student ID Type"           field="student_id_type"   value={form.student_id_type}   options={ID_TYPES} onChange={set} />
              <LField  label="Student ID Number"         field="student_id_number" value={form.student_id_number} onChange={set} />
              <p className="col-span-2 text-[12px] font-semibold text-slate-500 uppercase mt-1">Fee Information</p>
              <LField label="Tuition Fee (₹/mo)"     field="tuition_fee"       value={String(form.fees.tuition_fee)}       onChange={(_, v) => setFees("tuition_fee", Number(v))} placeholder="0" />
              <LField label="Concession Amount (₹)"  field="concession_amount" value={String(form.fees.concession_amount)} onChange={(_, v) => setFees("concession_amount", Number(v))} placeholder="0" />
              <LField label="Concession Reason"      field="concession_reason" value={form.fees.concession_reason}        onChange={(_, v) => setFees("concession_reason", v)} placeholder="e.g. Staff child" />
              <LField label="Transport Fee (₹/mo)"   field="transport_fee"     value={String(form.fees.transport_fee)}     onChange={(_, v) => setFees("transport_fee", Number(v))} placeholder="0" />
              <LField label="Other Monthly Fee (₹)"  field="other_monthly_fee" value={String(form.fees.other_monthly_fee)} onChange={(_, v) => setFees("other_monthly_fee", Number(v))} placeholder="0" />
              <LField label="Admission Fee (₹)"      field="admission_fee"     value={String(form.fees.admission_fee)}     onChange={(_, v) => setFees("admission_fee", Number(v))} placeholder="0" />
              <LField label="Admission Fee Paid (₹)" field="admission_fee_paid" value={String(form.fees.admission_fee_paid)} onChange={(_, v) => setFees("admission_fee_paid", Number(v))} placeholder="0" />
              <LField label="Book Fee (₹)"           field="book_fee"          value={String(form.fees.book_fee)}          onChange={(_, v) => setFees("book_fee", Number(v))} placeholder="0" />
              <LField label="Book Fee Paid (₹)"      field="book_fee_paid"     value={String(form.fees.book_fee_paid)}     onChange={(_, v) => setFees("book_fee_paid", Number(v))} placeholder="0" />
              <LField label="Uniform Fee (₹)"        field="uniform_fee"       value={String(form.fees.uniform_fee)}       onChange={(_, v) => setFees("uniform_fee", Number(v))} placeholder="0" />
              <LField label="Uniform Fee Paid (₹)"   field="uniform_fee_paid"  value={String(form.fees.uniform_fee_paid)}  onChange={(_, v) => setFees("uniform_fee_paid", Number(v))} placeholder="0" />
              <LSelect label="Fee Status"            field="fee_status"        value={form.fees.fee_status}               options={FEE_STATUS} onChange={(_, v) => setFees("fee_status", v)} />
              <Separator className="col-span-2 my-1" />
              <p className="col-span-2 text-[12px] font-semibold text-slate-500 uppercase">Upload Documents</p>
              <FileField label="Transfer Certificate"   accept=".pdf,image/*" />
              <FileField label="Character Certificate"  accept=".pdf,image/*" />
              <FileField label="Student ID / Aadhaar"   accept=".pdf,image/*" />
              <FileField label="Birth Certificate"      accept=".pdf,image/*" />
              <FileField label="Previous Marksheet"     accept=".pdf,image/*" />
              <FileField label="Medical Certificate"    accept=".pdf,image/*" />
            </div>
          )}

          {/* Step 2 — Guardian Info */}
          {step === 2 && (
            <div className="flex flex-col gap-5 pt-4">
              <div>
                <p className="text-[12px] font-bold text-slate-600 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#007BFF] text-white text-[10px] flex items-center justify-center">1</span>
                  Primary Guardian / Parent
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <LField  label="Full Name"  field="name"       value={form.guardian.name}       onChange={(_, v) => setG("name", v)} />
                  <LSelect label="Relation"   field="relation"   value={form.guardian.relation}   options={RELATIONS} onChange={(_, v) => setG("relation", v)} />
                  <LField  label="Phone"      field="phone" type="tel"      value={form.guardian.phone}      onChange={(_, v) => setG("phone", v)} />
                  <LField  label="Email"      field="email" type="email"      value={form.guardian.email}      onChange={(_, v) => setG("email", v)} />
                  <LField  label="Occupation" field="occupation" value={form.guardian.occupation} onChange={(_, v) => setG("occupation", v)} />
                  <div />
                  <LSelect label="ID Type"    field="id_type"    value={form.guardian.id_type}    options={ID_TYPES} onChange={(_, v) => setG("id_type", v)} />
                  <LField  label="ID Number"  field="id_number"  value={form.guardian.id_number}  onChange={(_, v) => setG("id_number", v)} />
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Address (if different)</label>
                    <textarea rows={2} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={form.guardian.address} onChange={(e) => setG("address", e.target.value)} />
                  </div>
                  <FileField label="Guardian Photo"    accept="image/*" />
                  <FileField label="Guardian ID Proof" accept=".pdf,image/*" />
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-[12px] font-bold text-slate-600 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-400 text-white text-[10px] flex items-center justify-center">2</span>
                  Secondary Guardian / Parent
                  <span className="text-[11px] font-normal text-slate-400">(optional)</span>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <LField  label="Full Name"  field="name"      value={form.guardian2.name}      onChange={(_, v) => setG2("name", v)} />
                  <LSelect label="Relation"   field="relation"  value={form.guardian2.relation}  options={RELATIONS} onChange={(_, v) => setG2("relation", v)} />
                  <LField  label="Phone"      field="phone" type="tel"     value={form.guardian2.phone}     onChange={(_, v) => setG2("phone", v)} />
                  <LField  label="Email"      field="email" type="email"     value={form.guardian2.email}     onChange={(_, v) => setG2("email", v)} />
                  <LSelect label="ID Type"    field="id_type"   value={form.guardian2.id_type}   options={ID_TYPES} onChange={(_, v) => setG2("id_type", v)} />
                  <LField  label="ID Number"  field="id_number" value={form.guardian2.id_number} onChange={(_, v) => setG2("id_number", v)} />
                  <FileField label="Guardian 2 Photo"    accept="image/*" />
                  <FileField label="Guardian 2 ID Proof" accept=".pdf,image/*" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 pt-0 shrink-0 border-t border-slate-100">
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5 mb-3">{error}</p>}
          <DialogFooter className="flex items-center justify-between gap-2 mt-0">
            <Button variant="outline" size="sm" className="h-8 text-[13px]"
              onClick={step === 0 ? handleClose : () => setStep((s) => s - 1)} disabled={saving}>
              {step === 0 ? "Cancel" : "← Back"}
            </Button>
            <div className="flex items-center gap-1">
              {STEPS.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors
                  ${i === step ? "bg-[#007BFF]" : i < step ? "bg-emerald-400" : "bg-slate-200"}`} />
              ))}
            </div>
            {step < STEPS.length - 1 ? (
              <Button size="sm" className="h-8 text-[13px] bg-[#007BFF] hover:bg-[#0069d9] text-white"
                onClick={() => setStep((s) => s + 1)}>
                Next →
              </Button>
            ) : (
              <Button size="sm" className="h-8 text-[13px] bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleSubmit} disabled={saving}>
                {saving
                  ? <><FontAwesomeIcon icon={faSpinner} className="mr-1.5 animate-spin" /> Saving…</>
                  : <><FontAwesomeIcon icon={faCircleCheck} className="mr-1.5" /> Submit</>}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
