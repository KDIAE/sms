"use client";

import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass, faPlus, faTrash, faChevronDown, faChevronUp,
  faCloudArrowUp, faFileLines, faCircleCheck, faUser, faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, isValid } from "date-fns";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";

// ── Types ─────────────────────────────────────────────────────────────────────

type Student = {
  id: string; name: string; dob: string; gender: string; bloodGroup: string;
  class: string; section: string; rollNo: string; admissionDate: string;
  phone: string; email: string; address: string;
  previousSchool: string; tcNumber: string; ccNumber: string;
  studentIdType: string; studentIdNumber: string;
  fee: string; attendance: number;
  guardian: string; guardianRelation: string; guardianPhone: string;
  guardianEmail: string; guardianAddress: string;
  guardianIdType: string; guardianIdNumber: string; guardianOccupation: string;
  guardian2: string; guardian2Relation: string; guardian2Phone: string;
  guardian2Email: string; guardian2IdType: string; guardian2IdNumber: string;
};

// ── Data ─────────────────────────────────────────────────────────────────────

const STUDENTS: Student[] = [
  {
    id: "S001", name: "Priya Chatterjee",  dob: "2013-04-12", gender: "Female", bloodGroup: "B+",
    class: "Class 5", section: "A", rollNo: "01", admissionDate: "2019-06-10",
    phone: "98300-11111", email: "priya@example.com", address: "12, Lake Road, Kolkata – 700029",
    previousSchool: "St. Mary's Primary", tcNumber: "TC/2019/045", ccNumber: "CC/2019/045",
    studentIdType: "Aadhaar", studentIdNumber: "1234 5678 9012",
    fee: "Paid", attendance: 94,
    guardian: "Sanjoy Chatterjee", guardianRelation: "Father", guardianPhone: "98300-11110",
    guardianEmail: "sanjoy@example.com", guardianAddress: "12, Lake Road, Kolkata – 700029",
    guardianIdType: "Aadhaar", guardianIdNumber: "9876 5432 1098", guardianOccupation: "Engineer",
    guardian2: "Mita Chatterjee", guardian2Relation: "Mother", guardian2Phone: "98300-11109",
    guardian2Email: "mita@example.com", guardian2IdType: "PAN", guardian2IdNumber: "ABCDE1234F",
  },
  {
    id: "S002", name: "Arjun Mukherjee",   dob: "2012-09-25", gender: "Male",   bloodGroup: "O+",
    class: "Class 6", section: "B", rollNo: "03", admissionDate: "2018-07-01",
    phone: "98300-22222", email: "arjun@example.com", address: "45, Park Street, Kolkata – 700016",
    previousSchool: "Delhi Public School", tcNumber: "TC/2018/112", ccNumber: "CC/2018/112",
    studentIdType: "Aadhaar", studentIdNumber: "2345 6789 0123",
    fee: "Paid", attendance: 88,
    guardian: "Tapan Mukherjee", guardianRelation: "Father", guardianPhone: "98300-22221",
    guardianEmail: "tapan@example.com", guardianAddress: "45, Park Street, Kolkata – 700016",
    guardianIdType: "Voter ID", guardianIdNumber: "WB/23/456/123456", guardianOccupation: "Doctor",
    guardian2: "Rita Mukherjee", guardian2Relation: "Mother", guardian2Phone: "98300-22220",
    guardian2Email: "rita@example.com", guardian2IdType: "Aadhaar", guardian2IdNumber: "3456 7890 1234",
  },
  {
    id: "S003", name: "Sneha Banerjee",    dob: "2014-02-18", gender: "Female", bloodGroup: "A+",
    class: "Class 4", section: "A", rollNo: "07", admissionDate: "2020-04-15",
    phone: "98300-33333", email: "sneha@example.com", address: "78, Ballygunge Place, Kolkata – 700019",
    previousSchool: "Nava Nalanda", tcNumber: "TC/2020/031", ccNumber: "CC/2020/031",
    studentIdType: "Birth Certificate", studentIdNumber: "BC/2014/KOL/9087",
    fee: "Partial", attendance: 72,
    guardian: "Rupa Banerjee", guardianRelation: "Mother", guardianPhone: "98300-33332",
    guardianEmail: "rupa@example.com", guardianAddress: "78, Ballygunge Place, Kolkata – 700019",
    guardianIdType: "Aadhaar", guardianIdNumber: "4567 8901 2345", guardianOccupation: "Teacher",
    guardian2: "", guardian2Relation: "", guardian2Phone: "",
    guardian2Email: "", guardian2IdType: "", guardian2IdNumber: "",
  },
  {
    id: "S004", name: "Rohan Das",         dob: "2015-11-05", gender: "Male",   bloodGroup: "AB-",
    class: "Class 3", section: "C", rollNo: "12", admissionDate: "2021-06-07",
    phone: "98300-44444", email: "rohan@example.com", address: "23, Shyambazar, Kolkata – 700004",
    previousSchool: "Little Flower School", tcNumber: "TC/2021/072", ccNumber: "CC/2021/072",
    studentIdType: "Aadhaar", studentIdNumber: "5678 9012 3456",
    fee: "Unpaid", attendance: 65,
    guardian: "Amit Das", guardianRelation: "Father", guardianPhone: "98300-44443",
    guardianEmail: "amit@example.com", guardianAddress: "23, Shyambazar, Kolkata – 700004",
    guardianIdType: "Passport", guardianIdNumber: "P1234567", guardianOccupation: "Business",
    guardian2: "Priti Das", guardian2Relation: "Mother", guardian2Phone: "98300-44442",
    guardian2Email: "priti@example.com", guardian2IdType: "Aadhaar", guardian2IdNumber: "6789 0123 4567",
  },
  {
    id: "S005", name: "Tanya Roy",         dob: "2013-07-30", gender: "Female", bloodGroup: "B-",
    class: "Class 5", section: "B", rollNo: "09", admissionDate: "2019-06-10",
    phone: "98300-55555", email: "tanya@example.com", address: "56, Alipore Road, Kolkata – 700027",
    previousSchool: "The Heritage School", tcNumber: "TC/2019/088", ccNumber: "CC/2019/088",
    studentIdType: "Aadhaar", studentIdNumber: "7890 1234 5678",
    fee: "Paid", attendance: 91,
    guardian: "Subhash Roy", guardianRelation: "Father", guardianPhone: "98300-55554",
    guardianEmail: "subhash@example.com", guardianAddress: "56, Alipore Road, Kolkata – 700027",
    guardianIdType: "PAN", guardianIdNumber: "BCDEF2345G", guardianOccupation: "Lawyer",
    guardian2: "Sudha Roy", guardian2Relation: "Mother", guardian2Phone: "98300-55553",
    guardian2Email: "sudha@example.com", guardian2IdType: "Voter ID", guardian2IdNumber: "WB/23/567/234567",
  },
];

const feeVariant: Record<string, string> = {
  Paid:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Unpaid:  "bg-red-50 text-red-700 border-red-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const CLASSES      = ["Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10"];
const SECTIONS     = ["A","B","C","D"];
const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const ID_TYPES     = ["Aadhaar","PAN","Passport","Voter ID","Driving Licence","Birth Certificate","Other"];
const RELATIONS    = ["Father","Mother","Guardian","Grandparent","Sibling","Other"];
const FEE_STATUS   = ["Paid","Partial","Unpaid"];

const BLANK_WIZARD = {
  name: "", dob: "", gender: "", bloodGroup: "", class: "", section: "", rollNo: "",
  admissionDate: "", phone: "", email: "", address: "",
  previousSchool: "", tcNumber: "", ccNumber: "", studentIdType: "", studentIdNumber: "",
  fee: "Paid", attendance: 100,
  guardian: "", guardianRelation: "", guardianPhone: "", guardianEmail: "",
  guardianAddress: "", guardianIdType: "", guardianIdNumber: "", guardianOccupation: "",
  guardian2: "", guardian2Relation: "", guardian2Phone: "",
  guardian2Email: "", guardian2IdType: "", guardian2IdNumber: "",
};

// ── FileField ─────────────────────────────────────────────────────────────────

function FileField({ label, accept = "*" }: { label: string; accept?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);
  return (
    <div>
      <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">{label}</label>
      <div
        className="flex items-center gap-2 cursor-pointer border border-dashed border-slate-300 rounded-md px-3 py-2 hover:border-[#007BFF] hover:bg-blue-50/40 transition-colors"
        onClick={() => ref.current?.click()}
      >
        <FontAwesomeIcon icon={faCloudArrowUp} className="text-slate-300 text-[13px]" />
        <span className={`text-[12px] truncate ${name ? "text-slate-700" : "text-slate-400"}`}>
          {name ?? "Click to upload…"}
        </span>
        {name && <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500 text-[12px] ml-auto shrink-0" />}
      </div>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => setName(e.target.files?.[0]?.name ?? null)} />
    </div>
  );
}

// ── Shared form fields ────────────────────────────────────────────────────────

function LField({ label, field, value, onChange, placeholder = "" }: {
  label: string; field: string; value: string | number;
  onChange: (f: string, v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">{label}</label>
      <Input placeholder={placeholder} value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="h-8 text-[13px] bg-white border-slate-200"
        onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

function LDatePicker({ label, field, value, onChange }: {
  label: string; field: string; value: string;
  onChange: (f: string, v: string) => void;
}) {
  const parsed = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;
  return (
    <div>
      <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">{label}</label>
      <Popover>
        <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
          <button className="flex items-center gap-2 w-full h-8 rounded-md border border-slate-200 bg-white px-3 text-[13px] text-left hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <FontAwesomeIcon icon={faCalendar} className="text-slate-400 text-[11px] shrink-0" />
            <span className={selected ? "text-slate-800" : "text-slate-400"}>
              {selected ? format(selected, "dd MMM yyyy") : "Pick a date…"}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" onClick={(e) => e.stopPropagation()}>
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => onChange(field, d ? format(d, "yyyy-MM-dd") : "")}
            captionLayout="dropdown"
            fromYear={1990}
            toYear={2030}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function LSelect({ label, field, value, options, onChange }: {
  label: string; field: string; value: string; options: string[];
  onChange: (f: string, v: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">{label}</label>
      <Select value={value} onValueChange={(v) => onChange(field, v)}>
        <SelectTrigger className="h-8 text-[13px] bg-white border-slate-200 w-full" onClick={(e) => e.stopPropagation()}>
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

// ── Stepper Wizard ────────────────────────────────────────────────────────────

const STEPS = [
  { icon: faUser,      label: "Student Info"  },
  { icon: faFileLines, label: "Documents"     },
  { icon: faUsers,     label: "Guardian Info" },
];

function StepperHeader({ step }: { step: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors whitespace-nowrap
            ${i === step ? "bg-[#007BFF] text-white" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
            <FontAwesomeIcon icon={i < step ? faCircleCheck : s.icon} className="text-[11px]" />
            {s.label}
          </div>
          {i < STEPS.length - 1 && <div className={`h-px flex-1 mx-2 ${i < step ? "bg-emerald-300" : "bg-slate-200"}`} />}
        </div>
      ))}
    </div>
  );
}

function AddStudentWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...BLANK_WIZARD });
  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));
  const handleClose = () => { setStep(0); setForm({ ...BLANK_WIZARD }); onClose(); };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="!max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        {/* Static header */}
        <div className="px-6 pt-6 pb-0 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold flex items-center gap-2">
              Add New Student
            </DialogTitle>
          </DialogHeader>
          <Separator className="my-3" />
          <StepperHeader step={step} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">

        {/* Step 0 – Student Info */}
        {step === 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <LField label="Full Name" field="name" value={form.name} onChange={set} placeholder="e.g. Priya Chatterjee" />
            </div>
            <LDatePicker label="Date of Birth" field="dob" value={form.dob} onChange={set} />
            <LSelect label="Gender"          field="gender"        value={form.gender}         options={["Male","Female","Other"]} onChange={set} />
            <LSelect label="Blood Group"     field="bloodGroup"    value={form.bloodGroup}     options={BLOOD_GROUPS} onChange={set} />
            <LSelect label="Class"           field="class"         value={form.class}          options={CLASSES} onChange={set} />
            <LSelect label="Section"         field="section"       value={form.section}        options={SECTIONS} onChange={set} />
            <LField label="Roll No."         field="rollNo"        value={form.rollNo}         onChange={set} placeholder="e.g. 01" />
            <LDatePicker label="Admission Date" field="admissionDate" value={form.admissionDate} onChange={set} />
            <LField label="Contact Phone"    field="phone"         value={form.phone}          onChange={set} placeholder="98300-XXXXX" />
            <LField label="Email (optional)" field="email"         value={form.email}          onChange={set} />
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Address</label>
              <textarea rows={2} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Full residential address" value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div className="col-span-2"><FileField label="Student Photo" accept="image/*" /></div>
          </div>
        )}

        {/* Step 1 – Documents */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <LField label="Previous School" field="previousSchool" value={form.previousSchool} onChange={set} placeholder="Name of last attended school" />
            </div>
            <LField label="Transfer Certificate No."  field="tcNumber"         value={form.tcNumber}         onChange={set} placeholder="TC/2024/001" />
            <LField label="Character Certificate No." field="ccNumber"         value={form.ccNumber}         onChange={set} placeholder="CC/2024/001" />
            <LSelect label="Student ID Type"          field="studentIdType"    value={form.studentIdType}    options={ID_TYPES} onChange={set} />
            <LField label="Student ID Number"         field="studentIdNumber"  value={form.studentIdNumber}  onChange={set} />
            <LSelect label="Fee Status"               field="fee"              value={form.fee}              options={FEE_STATUS} onChange={set} />
            <Separator className="col-span-2 my-1" />
            <p className="col-span-2 text-[12px] font-semibold text-slate-500 uppercase">Upload Documents</p>
            <FileField label="Transfer Certificate (PDF/Image)"   accept=".pdf,image/*" />
            <FileField label="Character Certificate (PDF/Image)"  accept=".pdf,image/*" />
            <FileField label="Student ID / Aadhaar (PDF/Image)"   accept=".pdf,image/*" />
            <FileField label="Birth Certificate (PDF/Image)"      accept=".pdf,image/*" />
            <FileField label="Previous Marksheet / Report Card"   accept=".pdf,image/*" />
            <FileField label="Medical Certificate (if any)"       accept=".pdf,image/*" />
          </div>
        )}

        {/* Step 2 – Guardian Info */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-[12px] font-bold text-slate-600 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#007BFF] text-white text-[10px] flex items-center justify-center">1</span>
                Primary Guardian / Parent
              </p>
              <div className="grid grid-cols-2 gap-4">
                <LField   label="Full Name"   field="guardian"           value={form.guardian}           onChange={set} />
                <LSelect  label="Relation"    field="guardianRelation"   value={form.guardianRelation}   options={RELATIONS} onChange={set} />
                <LField   label="Phone"       field="guardianPhone"      value={form.guardianPhone}      onChange={set} />
                <LField   label="Email"       field="guardianEmail"      value={form.guardianEmail}      onChange={set} />
                <LField   label="Occupation"  field="guardianOccupation" value={form.guardianOccupation} onChange={set} />
                <div />
                <LSelect  label="ID Type"     field="guardianIdType"     value={form.guardianIdType}     options={ID_TYPES} onChange={set} />
                <LField   label="ID Number"   field="guardianIdNumber"   value={form.guardianIdNumber}   onChange={set} />
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Address (if different)</label>
                  <textarea rows={2} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.guardianAddress} onChange={(e) => set("guardianAddress", e.target.value)} />
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
                <LField  label="Full Name"  field="guardian2"          value={form.guardian2}          onChange={set} />
                <LSelect label="Relation"   field="guardian2Relation"  value={form.guardian2Relation}  options={RELATIONS} onChange={set} />
                <LField  label="Phone"      field="guardian2Phone"     value={form.guardian2Phone}     onChange={set} />
                <LField  label="Email"      field="guardian2Email"     value={form.guardian2Email}     onChange={set} />
                <LSelect label="ID Type"    field="guardian2IdType"    value={form.guardian2IdType}    options={ID_TYPES} onChange={set} />
                <LField  label="ID Number"  field="guardian2IdNumber"  value={form.guardian2IdNumber}  onChange={set} />
                <FileField label="Guardian 2 Photo"    accept="image/*" />
                <FileField label="Guardian 2 ID Proof" accept=".pdf,image/*" />
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Static footer */}
        <div className="!p-4 !pt-0 shrink-0 border-t border-slate-100">
        <DialogFooter className="flex items-center justify-between gap-2 mt-0">
          <Button variant="outline" size="sm" className="h-8 text-[13px]"
            onClick={step === 0 ? handleClose : () => setStep((s) => s - 1)}>
            {step === 0 ? "Cancel" : "← Back"}
          </Button>
          <div className="flex items-center gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-[#007BFF]" : i < step ? "bg-emerald-400" : "bg-slate-200"}`} />
            ))}
          </div>
          {step < STEPS.length - 1 ? (
            <Button size="sm" className="h-8 text-[13px] bg-[#007BFF] hover:bg-[#0069d9] text-white" onClick={() => setStep((s) => s + 1)}>
              Next →
            </Button>
          ) : (
            <Button size="sm" className="h-8 text-[13px] bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleClose}>
              <FontAwesomeIcon icon={faCircleCheck} className="mr-1.5" /> Submit
            </Button>
          )}
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Inline expand panel ───────────────────────────────────────────────────────

function ExpandPanel({ s, onClose }: { s: Student; onClose: () => void }) {
  const [draft, setDraft] = useState<Student>({ ...s });
  const set = (f: string, v: string) => setDraft((p) => ({ ...p, [f]: v }));

  return (
    <TableRow className="bg-slate-50/80 border-slate-100">
      <TableCell colSpan={9} className="px-6 py-5">
        <div className="flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>

          {/* Student details */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="text-[#007BFF]" /> Student Information
            </p>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2"><LField label="Full Name" field="name" value={draft.name} onChange={set} /></div>
              <LDatePicker label="Date of Birth" field="dob" value={draft.dob} onChange={set} />
              <LField   label="Roll No."        field="rollNo"        value={draft.rollNo}         onChange={set} />
              <LSelect  label="Gender"          field="gender"        value={draft.gender}         options={["Male","Female","Other"]} onChange={set} />
              <LSelect  label="Blood Group"     field="bloodGroup"    value={draft.bloodGroup}     options={BLOOD_GROUPS} onChange={set} />
              <LSelect  label="Class"           field="class"         value={draft.class}          options={CLASSES} onChange={set} />
              <LSelect  label="Section"         field="section"       value={draft.section}        options={SECTIONS} onChange={set} />
              <LField   label="Phone"           field="phone"         value={draft.phone}          onChange={set} />
              <LField   label="Email"           field="email"         value={draft.email}          onChange={set} />
              <LDatePicker label="Admission Date" field="admissionDate" value={draft.admissionDate} onChange={set} />
              <LSelect  label="Fee Status"      field="fee"           value={draft.fee}            options={FEE_STATUS} onChange={set} />
              <div className="col-span-4">
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Address</label>
                <Input value={draft.address} onChange={(e) => set("address", e.target.value)} className="h-8 text-[12px] bg-white border-slate-200" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Documents */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faFileLines} className="text-[#007BFF]" /> Documents & Certificates
            </p>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2"><LField label="Previous School" field="previousSchool" value={draft.previousSchool} onChange={set} /></div>
              <LField  label="TC Number"         field="tcNumber"         value={draft.tcNumber}         onChange={set} />
              <LField  label="CC Number"         field="ccNumber"         value={draft.ccNumber}         onChange={set} />
              <LSelect label="Student ID Type"   field="studentIdType"   value={draft.studentIdType}    options={ID_TYPES} onChange={set} />
              <LField  label="Student ID Number" field="studentIdNumber" value={draft.studentIdNumber}  onChange={set} />
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
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {/* Guardian 1 */}
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-bold text-slate-500">Primary Guardian</p>
                <div className="grid grid-cols-2 gap-3">
                  <LField  label="Name"       field="guardian"           value={draft.guardian}           onChange={set} />
                  <LSelect label="Relation"   field="guardianRelation"   value={draft.guardianRelation}   options={RELATIONS} onChange={set} />
                  <LField  label="Phone"      field="guardianPhone"      value={draft.guardianPhone}      onChange={set} />
                  <LField  label="Email"      field="guardianEmail"      value={draft.guardianEmail}      onChange={set} />
                  <LField  label="Occupation" field="guardianOccupation" value={draft.guardianOccupation} onChange={set} />
                  <div />
                  <LSelect label="ID Type"    field="guardianIdType"     value={draft.guardianIdType}     options={ID_TYPES} onChange={set} />
                  <LField  label="ID Number"  field="guardianIdNumber"   value={draft.guardianIdNumber}   onChange={set} />
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Address (if different)</label>
                    <Input value={draft.guardianAddress} onChange={(e) => set("guardianAddress", e.target.value)} className="h-8 text-[12px] bg-white border-slate-200" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FileField label="Replace Guardian Photo"    accept="image/*" />
                  <FileField label="Replace Guardian ID Proof" accept=".pdf,image/*" />
                </div>
              </div>
              {/* Guardian 2 */}
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-bold text-slate-500">Secondary Guardian <span className="text-slate-400 font-normal">(optional)</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <LField  label="Name"      field="guardian2"          value={draft.guardian2}          onChange={set} />
                  <LSelect label="Relation"  field="guardian2Relation"  value={draft.guardian2Relation}  options={RELATIONS} onChange={set} />
                  <LField  label="Phone"     field="guardian2Phone"     value={draft.guardian2Phone}     onChange={set} />
                  <LField  label="Email"     field="guardian2Email"     value={draft.guardian2Email}     onChange={set} />
                  <LSelect label="ID Type"   field="guardian2IdType"    value={draft.guardian2IdType}    options={ID_TYPES} onChange={set} />
                  <LField  label="ID Number" field="guardian2IdNumber"  value={draft.guardian2IdNumber}  onChange={set} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FileField label="Replace Guardian 2 Photo"    accept="image/*" />
                  <FileField label="Replace Guardian 2 ID Proof" accept=".pdf,image/*" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" className="h-7 text-[12px]" onClick={onClose}>Cancel</Button>
            <Button size="sm" className="h-7 text-[12px] bg-[#007BFF] hover:bg-[#0069d9] text-white" onClick={onClose}>
              Save Changes
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const [search, setSearch]           = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterFee, setFilterFee]     = useState("All");
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [showWizard, setShowWizard]   = useState(false);

  const filtered = STUDENTS.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchClass  = filterClass === "All" || s.class === filterClass;
    const matchFee    = filterFee   === "All" || s.fee   === filterFee;
    return matchSearch && matchClass && matchFee;
  });

  const classes = Array.from(new Set(STUDENTS.map((s) => s.class)));

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Students" description="Manage all enrolled students" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-6">

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Students",       value: STUDENTS.length },
                { label: "Fee Paid",              value: STUDENTS.filter((s) => s.fee === "Paid").length },
                { label: "Partial / Unpaid",      value: STUDENTS.filter((s) => s.fee !== "Paid").length },
                { label: "Below 75% Attendance",  value: STUDENTS.filter((s) => s.attendance < 75).length },
              ].map((st) => (
                <Card key={st.label} className="shadow-none border-slate-200">
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold text-slate-900">{st.value}</p>
                    <p className="text-[12px] text-slate-500 mt-0.5">{st.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Table card */}
            <Card className="shadow-none border-slate-200 pb-0">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[14px] font-semibold">All Students</CardTitle>
                  <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white text-[13px] h-8 gap-2"
                    onClick={() => setShowWizard(true)}>
                    <FontAwesomeIcon icon={faPlus} className="text-[11px]" /> Add Student
                  </Button>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="relative flex-1 max-w-[260px]">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]" />
                    <Input placeholder="Search by name or ID…" value={search} onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 bg-slate-50 border-slate-200 text-[13px] h-8" />
                  </div>
                  <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200 text-[13px] h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Classes</SelectItem>
                      {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterFee} onValueChange={setFilterFee}>
                    <SelectTrigger className="w-[130px] bg-slate-50 border-slate-200 text-[13px] h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Fee Status</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent className="p-0 pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      {[
                        { h: "ID",          cls: "pl-6" },
                        { h: "Name" },
                        { h: "Class" },
                        { h: "Gender" },
                        { h: "Fee Status" },
                        { h: "Attendance" },
                        { h: "Guardian" },
                        { h: "Phone" },
                        { h: "",            cls: "w-10 pr-4" },
                      ].map(({ h, cls = "" }, i) => (
                        <TableHead key={i} className={`text-[11px] font-semibold uppercase text-slate-500 ${cls}`}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s) => {
                      const isOpen = expandedId === s.id;
                      return (
                        <>
                          <TableRow key={s.id}
                            className="hover:bg-slate-50 border-slate-100 cursor-pointer select-none"
                            onClick={() => setExpandedId(isOpen ? null : s.id)}>
                            <TableCell className="text-[12px] text-slate-400 font-mono pl-6">{s.id}</TableCell>
                            <TableCell className="text-[13px] font-medium text-slate-900">{s.name}</TableCell>
                            <TableCell className="text-[13px] text-slate-600">{s.class} – {s.section}</TableCell>
                            <TableCell className="text-[13px] text-slate-600">{s.gender}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${feeVariant[s.fee]}`}>
                                {s.fee}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={s.attendance} className="h-1.5 w-16" />
                                <span className={`text-[12px] font-medium ${s.attendance < 75 ? "text-red-600" : "text-slate-700"}`}>
                                  {s.attendance}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-[13px] text-slate-600">
                              <div>{s.guardian}</div>
                              <div className="text-[11px] text-slate-400">{s.guardianRelation}</div>
                            </TableCell>
                            <TableCell className="text-[13px] text-slate-500">{s.guardianPhone}</TableCell>
                            <TableCell className="pr-4 w-10" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-red-500">
                                  <FontAwesomeIcon icon={faTrash} className="text-[12px]" />
                                </Button>
                                <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown}
                                  className="text-[11px] text-slate-300 ml-1 pointer-events-none" />
                              </div>
                            </TableCell>
                          </TableRow>

                          {isOpen && (
                            <ExpandPanel key={`${s.id}-expand`} s={s} onClose={() => setExpandedId(null)} />
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AddStudentWizard open={showWizard} onClose={() => setShowWizard(false)} />
    </div>
  );
}
