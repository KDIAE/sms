"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser, faFileLines, faUsers, faTrash, faSpinner, faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { admissionsApi, type Admission } from "@/lib/api";
import { LField } from "@/components/form/LField";
import { LDatePicker } from "@/components/form/LDatePicker";
import { LSelect } from "@/components/form/LSelect";
import { BLOOD_GROUPS, ID_TYPES, RELATIONS, FEE_STATUS, SECTIONS } from "@/components/form/constants";
import { EARLY_CLASSES, CLASS_LIST, ACADEMIC_YEARS, ALL_STATUSES } from "./constants";

export function AdmissionExpandPanel({
  app, classesList, onSaved, onDeleted, onEnrolled, mobile = false,
}: {
  app: Admission;
  classesList: string[];
  onSaved: (updated: Admission) => void;
  onDeleted: (id: string) => void;
  onEnrolled: () => void;
  mobile?: boolean;
}) {
  const [draft, setDraft] = useState<Admission>({ ...app });
  const [saving, setSaving] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [enrollMsg, setEnrollMsg] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setDraft({ ...app });
      setError("");
      setEnrollMsg("");
    }, 0);
    return () => clearTimeout(handle);
  }, [app]);

  const set = (f: string, v: string) => setDraft((p) => ({ ...p, [f]: v }));
  const setG = (f: string, v: string) => setDraft((p) => ({ ...p, guardian: { ...p.guardian, [f]: v } }));
  const setFees = (f: string, v: string | number) => setDraft((p) => ({ ...p, fees: { ...p.fees, [f]: v } }));

  const isEarly = EARLY_CLASSES.has(draft.applying_for_class);
  const allClassOptions = classesList.length > 0 ? classesList : CLASS_LIST;

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const { id, ...rest } = draft;
      const updated = await admissionsApi.update(id, rest);
      onSaved(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete application ${app.application_code}? This cannot be undone.`)) return;
    try {
      await admissionsApi.delete(app.id);
      onDeleted(app.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete.");
    }
  };

  const handleEnroll = async () => {
    if (!confirm(`Enroll ${app.applicant_name} as a student? This will create a new student record.`)) return;
    setEnrolling(true); setError("");
    try {
      const res = await admissionsApi.enroll(app.id);
      setEnrollMsg(`✓ Enrolled as student ${res.student_code}`);
      onEnrolled();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Enrolment failed.");
    } finally {
      setEnrolling(false);
    }
  };

  const content = (
    <div className="flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>

          {/* Applicant Information */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="text-[#007BFF]" /> Applicant Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="xl:col-span-2">
                <LField label="Full Name" field="applicant_name" value={draft.applicant_name} onChange={set} />
              </div>
              <LDatePicker label="Date of Birth"      field="dob"                value={draft.dob}                onChange={set} />
              <LSelect     label="Gender"             field="gender"             value={draft.gender}             options={["Male","Female","Other"]} onChange={set} />
              <LSelect     label="Blood Group"        field="blood_group"        value={draft.blood_group}        options={BLOOD_GROUPS} onChange={set} />
              <LSelect     label="Applying for Class" field="applying_for_class" value={draft.applying_for_class} options={allClassOptions} onChange={set} />
              <LSelect     label="Section Preference" field="section_preference" value={draft.section_preference} options={SECTIONS} onChange={set} />
              <LSelect     label="Academic Year"      field="academic_year"      value={draft.academic_year}      options={ACADEMIC_YEARS} onChange={set} />
              <LField      label="Phone"              field="phone" type="tel"              value={draft.phone}              onChange={set} />
              <LField      label="Email"              field="email" type="email"              value={draft.email}              onChange={set} />
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
              <FontAwesomeIcon icon={faFileLines} className="text-[#007BFF]" /> Documents
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {!isEarly ? (
                <>
                  <div className="sm:col-span-2 xl:col-span-2">
                    <LField label="Previous School" field="previous_school" value={draft.previous_school} onChange={set} />
                  </div>
                  <LField label="TC Number" field="tc_number" value={draft.tc_number} onChange={set} />
                  <LField label="CC Number" field="cc_number" value={draft.cc_number} onChange={set} />
                </>
              ) : (
                <div className="sm:col-span-2 xl:col-span-4 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-[12px] text-emerald-700">
                  Early-childhood class — TC &amp; CC not required.
                </div>
              )}
              <LSelect label="ID Type"   field="student_id_type"   value={draft.student_id_type}   options={ID_TYPES} onChange={set} />
              <LField  label="ID Number" field="student_id_number" value={draft.student_id_number} onChange={set} />
            </div>
          </div>

          <Separator />

          {/* Guardian */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faUsers} className="text-[#007BFF]" /> Guardian
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <LField  label="Name"       field="name"       value={draft.guardian.name}       onChange={(_, v) => setG("name", v)} />
              <LSelect label="Relation"   field="relation"   value={draft.guardian.relation}   options={RELATIONS} onChange={(_, v) => setG("relation", v)} />
              <LField  label="Phone"      field="phone" type="tel"      value={draft.guardian.phone}      onChange={(_, v) => setG("phone", v)} />
              <LField  label="Email"      field="email" type="email"      value={draft.guardian.email}      onChange={(_, v) => setG("email", v)} />
              <LField  label="Occupation" field="occupation" value={draft.guardian.occupation} onChange={(_, v) => setG("occupation", v)} />
              <LSelect label="ID Type"    field="id_type"    value={draft.guardian.id_type}    options={ID_TYPES} onChange={(_, v) => setG("id_type", v)} />
              <LField  label="ID Number"  field="id_number"  value={draft.guardian.id_number}  onChange={(_, v) => setG("id_number", v)} />
              <div className="sm:col-span-2 xl:col-span-1">
                <LField label="Guardian Address" field="address" value={draft.guardian.address} onChange={(_, v) => setG("address", v)} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Fees */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-3">Fee Structure</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <LField  label="Tuition Fee (₹/mo)"    field="tuition_fee"        value={String(draft.fees.tuition_fee)}        onChange={(_, v) => setFees("tuition_fee", Number(v))} />
              <LField  label="Concession (₹)"        field="concession_amount"  value={String(draft.fees.concession_amount)}  onChange={(_, v) => setFees("concession_amount", Number(v))} />
              <LField  label="Concession Reason"     field="concession_reason"  value={draft.fees.concession_reason}         onChange={(_, v) => setFees("concession_reason", v)} />
              <LField  label="Transport Fee (₹/mo)"  field="transport_fee"      value={String(draft.fees.transport_fee)}      onChange={(_, v) => setFees("transport_fee", Number(v))} />
              <LField  label="Admission Fee (₹)"     field="admission_fee"      value={String(draft.fees.admission_fee)}      onChange={(_, v) => setFees("admission_fee", Number(v))} />
              <LField  label="Admission Paid (₹)"    field="admission_fee_paid" value={String(draft.fees.admission_fee_paid)} onChange={(_, v) => setFees("admission_fee_paid", Number(v))} />
              <LSelect label="Fee Status"            field="fee_status"         value={draft.fees.fee_status}                options={FEE_STATUS} onChange={(_, v) => setFees("fee_status", v)} />
            </div>
          </div>

          <Separator />

          {/* Status & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <LSelect label="Application Status" field="status" value={draft.status} options={ALL_STATUSES} onChange={set} />
            <div className="sm:col-span-2 xl:col-span-3">
              <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Remarks / Notes</label>
              <Input value={draft.remarks} onChange={(e) => set("remarks", e.target.value)}
                className="h-8 text-[12px] bg-white border-slate-200" />
            </div>
          </div>

          {error && <p className="text-[12px] text-red-500">{error}</p>}
          {enrollMsg && <p className="text-[12px] text-emerald-600 font-semibold">{enrollMsg}</p>}

          {/* Action bar */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <Button variant="ghost" size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50 text-[12px] h-8 sm:h-7 w-full sm:w-auto"
              onClick={handleDelete}>
              <FontAwesomeIcon icon={faTrash} className="mr-1.5" />
              Delete Application
            </Button>
            <div className="grid grid-cols-1 sm:flex gap-2 w-full sm:w-auto">
              {(draft.status === "Approved" || draft.status === "Pending" || draft.status === "Under Review") && (
                <Button size="sm" variant="outline"
                  className="text-[12px] h-8 sm:h-7 border-violet-300 text-violet-700 hover:bg-violet-50 w-full sm:w-auto"
                  onClick={handleEnroll} disabled={enrolling}>
                  {enrolling
                    ? <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-1.5" />
                    : <FontAwesomeIcon icon={faGraduationCap} className="mr-1.5" />}
                  Enroll as Student
                </Button>
              )}
              <Button size="sm" className="text-[12px] h-8 sm:h-7 bg-[#007BFF] hover:bg-[#0069d9] w-full sm:w-auto"
                onClick={handleSave} disabled={saving}>
                {saving ? <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-1.5" /> : null}
                Save Changes
              </Button>
            </div>
          </div>

    </div>
  );

  if (mobile) {
    return <div className="border-t border-slate-100 p-3 bg-slate-50/70">{content}</div>;
  }

  return (
    <TableRow className="bg-slate-50/80 border-slate-100">
      <TableCell colSpan={7} className="px-6 py-5">
        {content}
      </TableCell>
    </TableRow>
  );
}
