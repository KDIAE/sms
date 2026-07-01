"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faFileLines, faUsers, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { studentsApi, type Student, type ClassFeeStructure } from "@/lib/api";
import { LField } from "@/components/form/LField";
import { LDatePicker } from "@/components/form/LDatePicker";
import { LSelect } from "@/components/form/LSelect";
import { FileField } from "@/components/form/FileField";
import { BLOOD_GROUPS, ID_TYPES, RELATIONS, SECTIONS } from "@/components/form/constants";
import { useAuth } from "@/lib/auth-context";
import usePlacesAutocomplete from "use-places-autocomplete";

// ── Google Maps Places Autocomplete ──────────────────────────────────────────
function AddressAutocomplete({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const {
    ready,
    value: query,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: "in" } },
    debounce: 300,
  });

  // Sync external value → input when suggestions aren't open
  const [focused, setFocused] = useState(false);
  const inputValue = focused ? query : value;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };

  const handleSelect = (description: string) => {
    setValue(description, false);
    onChange(description);
    clearSuggestions();
    setFocused(false);
  };

  return (
    <div className="relative">
      <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">{label}</label>
      <Input
        value={inputValue}
        onChange={handleInput}
        onFocus={() => { setFocused(true); setValue(value, false); }}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        className="h-8 text-[12px] bg-white border-slate-200"
        placeholder="Start typing an address…"
        autoComplete="off"
      />
      {status === "OK" && focused && data.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-md text-[12px] max-h-48 overflow-y-auto">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              className="px-3 py-2 cursor-pointer hover:bg-slate-50 text-slate-700 border-b border-slate-100 last:border-0"
              onMouseDown={() => handleSelect(description)}
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StudentExpandPanel({
  s, onClose, classesList, feeStructures = [], onUpdated, mobile = false, existingCodes = [],
}: {
  s: Student;
  onClose: () => void;
  classesList: string[];
  feeStructures?: ClassFeeStructure[];
  onUpdated: (updated: Student) => void;
  mobile?: boolean;
  existingCodes?: string[];
}) {
  const { user } = useAuth();
  const isPrincipal = user?.role === "principal";

  const [draft, setDraft] = useState<Student>({ ...s });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [concessionEnabled, setConcessionEnabled] = useState(
    (s.fees.concession_amount ?? 0) > 0 ||
    (s.fees.admission_concession_amount ?? 0) > 0 ||
    (s.fees.book_concession_amount ?? 0) > 0 ||
    (s.fees.uniform_concession_amount ?? 0) > 0 ||
    Boolean(s.fees.concession_reason)
  );

  const set    = (f: string, v: string) => setDraft((p) => ({ ...p, [f]: v }));
  const setG   = (f: string, v: string) => setDraft((p) => ({ ...p, guardian:  { ...p.guardian,  [f]: v } }));
  const setG2  = (f: string, v: string) => setDraft((p) => ({ ...p, guardian2: { ...p.guardian2, [f]: v } }));
  const setFees = (f: string, v: string | number) => setDraft((p) => ({ ...p, fees: { ...p.fees, [f]: v } }));

  // Auto-populate fees when class changes
  const prevClass = useRef(draft.class_name);
  useEffect(() => {
    if (draft.class_name === prevClass.current) return;
    prevClass.current = draft.class_name;
    const struct = feeStructures.find((st) => st.class_name === draft.class_name);
    if (struct) {
      setDraft((p) => ({
        ...p,
        fees: {
          ...p.fees,
          tuition_fee:      struct.tuition_fee,
          transport_fee:    struct.transport_fee,
          uniform_fee:      struct.uniform_fee,
          admission_fee:    struct.admission_fee,
          registration_fee: struct.registration_fee,
          annual_fee:       struct.annual_fee,
        },
      }));
    }
  }, [draft.class_name, feeStructures]);

  const handleConcessionToggle = (enabled: boolean) => {
    setConcessionEnabled(enabled);
    if (!enabled) {
      setDraft((p) => ({
        ...p,
        fees: {
          ...p.fees,
          concession_amount: 0,
          concession_reason: "",
          admission_concession_amount: 0,
          book_concession_amount: 0,
          uniform_concession_amount: 0,
        },
      }));
    }
  };

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
              <div className="sm:col-span-2 xl:col-span-4">
                <AddressAutocomplete
                  label="Address"
                  value={draft.address}
                  onChange={(v) => set("address", v)}
                />
              </div>
              {!isPrincipal && (
                <>
                  <div className="sm:col-span-2 xl:col-span-4"><Separator className="my-1" /></div>
                  <p className="sm:col-span-2 xl:col-span-4 text-[11px] font-bold text-slate-400 uppercase">Fee Information</p>

                  <LField label="Tuition Fee (₹/mo)"    field="tuition_fee"       value={String(draft.fees.tuition_fee)}       onChange={(_, v) => setFees("tuition_fee", Number(v))} />
                  <LField label="Transport Fee (₹/mo)"  field="transport_fee"     value={String(draft.fees.transport_fee)}     onChange={(_, v) => setFees("transport_fee", Number(v))} />
                  <LField label="Other Monthly Fee (₹)" field="other_monthly_fee" value={String(draft.fees.other_monthly_fee)} onChange={(_, v) => setFees("other_monthly_fee", Number(v))} />
                  <LField label="Registration Fee (₹)"  field="registration_fee"  value={String(draft.fees.registration_fee)}  onChange={(_, v) => setFees("registration_fee", Number(v))} />
                  <LField label="Annual Fee (₹)"        field="annual_fee"        value={String(draft.fees.annual_fee)}        onChange={(_, v) => setFees("annual_fee",       Number(v))} />
                  <LField label="Admission Fee (₹)"      field="admission_fee"      value={String(draft.fees.admission_fee)}      onChange={(_, v) => setFees("admission_fee", Number(v))} />
                  <LField label="Admission Fee Paid (₹)" field="admission_fee_paid" value={String(draft.fees.admission_fee_paid)} onChange={(_, v) => setFees("admission_fee_paid", Number(v))} />
                  <LField label="Book Fee (₹)"           field="book_fee"           value={String(draft.fees.book_fee)}           onChange={(_, v) => setFees("book_fee", Number(v))} />
                  <LField label="Book Fee Paid (₹)"      field="book_fee_paid"      value={String(draft.fees.book_fee_paid)}      onChange={(_, v) => setFees("book_fee_paid", Number(v))} />
                  <LField label="Uniform Fee (₹)"        field="uniform_fee"        value={String(draft.fees.uniform_fee)}        onChange={(_, v) => setFees("uniform_fee", Number(v))} />
                  <LField label="Uniform Fee Paid (₹)"   field="uniform_fee_paid"   value={String(draft.fees.uniform_fee_paid)}   onChange={(_, v) => setFees("uniform_fee_paid", Number(v))} />

                  {/* Concession toggle */}
                  <div className="sm:col-span-2 xl:col-span-4"><Separator className="my-1" /></div>
                  <div className="sm:col-span-2 xl:col-span-4 flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Fee Concession</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">{concessionEnabled ? "Enabled" : "Disabled"}</span>
                      <Switch checked={concessionEnabled} onCheckedChange={handleConcessionToggle} />
                    </div>
                  </div>
                  {concessionEnabled && (
                    <>
                      <div className="sm:col-span-2 xl:col-span-4">
                        <LField label="Concession Reason" field="concession_reason" value={draft.fees.concession_reason} onChange={(_, v) => setFees("concession_reason", v)} />
                      </div>
                      <LField label="Tuition Concession (₹/mo)"   field="concession_amount"            value={String(draft.fees.concession_amount)}            onChange={(_, v) => setFees("concession_amount", Number(v))} />
                      <LField label="Admission Concession (₹)"    field="admission_concession_amount"  value={String(draft.fees.admission_concession_amount)}  onChange={(_, v) => setFees("admission_concession_amount", Number(v))} />
                      <LField label="Book Concession (₹)"         field="book_concession_amount"       value={String(draft.fees.book_concession_amount)}       onChange={(_, v) => setFees("book_concession_amount", Number(v))} />
                      <LField label="Uniform Concession (₹)"      field="uniform_concession_amount"    value={String(draft.fees.uniform_concession_amount)}    onChange={(_, v) => setFees("uniform_concession_amount", Number(v))} />
                    </>
                  )}
                </>
              )}
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
                    <AddressAutocomplete
                      label="Address (if different)"
                      value={draft.guardian.address}
                      onChange={(v) => setG("address", v)}
                    />
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
