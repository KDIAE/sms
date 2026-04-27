"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faChalkboardTeacher, faUsers, faBookOpen,
  faGraduationCap, faCheck, faPencil, faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

// ── Data ─────────────────────────────────────────────────────────────────────

type ClassEntry = {
  id: string; name: string; sections: string[]; students: number;
  teacher: string; subjects: string[];
};

const CLASSES_DATA: ClassEntry[] = [
  { id: "C001", name: "Nursery", sections: ["A", "B"],       students: 45, teacher: "Mrs. Mita Saha",       subjects: ["English", "Bengali", "Math", "Drawing"] },
  { id: "C002", name: "Class 1", sections: ["A", "B", "C"], students: 68, teacher: "Mrs. Poulami Roy",      subjects: ["English", "Bengali", "Math", "EVS", "Drawing"] },
  { id: "C003", name: "Class 2", sections: ["A", "B", "C"], students: 72, teacher: "Mr. Ratan Das",         subjects: ["English", "Bengali", "Math", "EVS", "Drawing"] },
  { id: "C004", name: "Class 3", sections: ["A", "B", "C"], students: 65, teacher: "Mrs. Sudha Pal",        subjects: ["English", "Bengali", "Math", "Science", "Social", "Drawing"] },
  { id: "C005", name: "Class 4", sections: ["A", "B", "C"], students: 58, teacher: "Mr. Subir Bose",        subjects: ["English", "Bengali", "Math", "Science", "Social", "Sanskrit"] },
  { id: "C006", name: "Class 5", sections: ["A", "B"],       students: 54, teacher: "Mrs. Priya Ghosh",     subjects: ["English", "Bengali", "Math", "Science", "Social", "Sanskrit", "Computer"] },
  { id: "C007", name: "Class 6", sections: ["A", "B"],       students: 49, teacher: "Mr. Sanjay Banerjee",  subjects: ["English", "Bengali", "Math", "Science", "Social", "Sanskrit", "Computer"] },
];

const SUBJECT_COLORS: Record<string, string> = {
  English:  "bg-blue-50   text-blue-700   border-blue-200",
  Bengali:  "bg-orange-50 text-orange-700 border-orange-200",
  Math:     "bg-violet-50 text-violet-700 border-violet-200",
  EVS:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  Science:  "bg-cyan-50   text-cyan-700   border-cyan-200",
  Social:   "bg-amber-50  text-amber-700  border-amber-200",
  Drawing:  "bg-pink-50   text-pink-700   border-pink-200",
  Sanskrit: "bg-red-50    text-red-700    border-red-200",
  Computer: "bg-slate-100 text-slate-700  border-slate-200",
};

const ALL_SUBJECTS = ["English","Bengali","Math","EVS","Science","Social","Drawing","Sanskrit","Computer","Hindi","History","Geography","Physics","Chemistry","Biology"];
const ALL_SECTIONS = ["A","B","C","D","E"];

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: typeof faUsers; label: string; value: number | string }) {
  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="w-9 h-9 rounded-lg bg-[#007BFF]/10 flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={icon} className="text-[14px] text-[#007BFF]" />
        </div>
        <div>
          <p className="text-xl font-bold text-slate-900 leading-none">{value}</p>
          <p className="text-[12px] text-slate-500 mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Class row card ────────────────────────────────────────────────────────────

function ClassCard({ cls }: { cls: ClassEntry }) {
  return (
    <Card className="shadow-none border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-150">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Left: identity */}
          <div className="flex flex-col justify-center px-5 py-4 min-w-[160px] border-r border-slate-100">
            <p className="text-[15px] font-bold text-slate-900">{cls.name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <FontAwesomeIcon icon={faChalkboardTeacher} className="text-[10px]" />
              {cls.teacher}
            </p>
          </div>

          {/* Center: sections + subjects */}
          <div className="flex-1 px-5 py-4 flex flex-col justify-center gap-2.5">
            {/* Sections */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase w-14 shrink-0">Sections</span>
              <div className="flex gap-1">
                {cls.sections.map((s) => (
                  <span key={s}
                    className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-[#007BFF]/10 text-[#007BFF]">
                    {s}
                  </span>
                ))}
                <span className="text-[11px] text-slate-400 ml-1 self-center">
                  {cls.sections.length} section{cls.sections.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Subjects */}
            <div className="flex items-start gap-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase w-14 shrink-0 mt-0.5">Subjects</span>
              <div className="flex flex-wrap gap-1">
                {cls.subjects.map((sub) => (
                  <span key={sub}
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${SUBJECT_COLORS[sub] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: stats + actions */}
          <div className="flex flex-col justify-center items-end px-5 py-4 border-l border-slate-100 gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[18px] font-bold text-slate-900 leading-none">{cls.students}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">students</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-[#007BFF] hover:bg-blue-50">
                <FontAwesomeIcon icon={faPencil} className="text-[11px]" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50">
                <FontAwesomeIcon icon={faTrash} className="text-[11px]" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Add Class Dialog ──────────────────────────────────────────────────────────

const BLANK = { name: "", teacher: "", sections: [] as string[], subjects: [] as string[] };

function AddClassDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ ...BLANK });

  const toggle = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const handleClose = () => { setForm({ ...BLANK }); onClose(); };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="!max-w-lg max-h-[90vh] flex flex-col overflow-hidden p-0">
        {/* Header */}
        <div className="px-6 pt-6 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">Add New Class</DialogTitle>
          </DialogHeader>
        </div>
        <Separator />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Class Name</label>
            <Input placeholder="e.g. Class 7" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="h-8 text-[13px] bg-white border-slate-200" />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Class Teacher</label>
            <Input placeholder="e.g. Mrs. Anita Sen" value={form.teacher}
              onChange={(e) => setForm((p) => ({ ...p, teacher: e.target.value }))}
              className="h-8 text-[13px] bg-white border-slate-200" />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-2">Sections</label>
            <div className="flex gap-2">
              {ALL_SECTIONS.map((s) => {
                const active = form.sections.includes(s);
                return (
                  <button key={s}
                    onClick={() => setForm((p) => ({ ...p, sections: toggle(p.sections, s) }))}
                    className={`w-9 h-9 rounded-lg text-[13px] font-bold border-2 transition-all
                      ${active
                        ? "bg-[#007BFF] text-white border-[#007BFF]"
                        : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"}`}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-2">
              Subjects
              <span className="ml-2 text-[10px] font-normal text-slate-400 normal-case">
                ({form.subjects.length} selected)
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_SUBJECTS.map((sub) => {
                const active = form.subjects.includes(sub);
                return (
                  <button key={sub}
                    onClick={() => setForm((p) => ({ ...p, subjects: toggle(p.subjects, sub) }))}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border transition-all
                      ${active
                        ? `${SUBJECT_COLORS[sub] ?? "bg-slate-100 text-slate-700 border-slate-200"}`
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                    {active && <FontAwesomeIcon icon={faCheck} className="text-[9px]" />}
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-0 shrink-0 border-t border-slate-100">
          <DialogFooter className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-[13px]" onClick={handleClose}>Cancel</Button>
            <Button size="sm" className="h-8 text-[13px] bg-[#007BFF] hover:bg-[#0069d9] text-white" onClick={handleClose}>
              <FontAwesomeIcon icon={faPlus} className="mr-1.5 text-[11px]" /> Create Class
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClassesPage() {
  const [showDialog, setShowDialog] = useState(false);

  const totalSections = CLASSES_DATA.reduce((a, c) => a + c.sections.length, 0);
  const totalStudents = CLASSES_DATA.reduce((a, c) => a + c.students, 0);
  const allSubjects   = Array.from(new Set(CLASSES_DATA.flatMap((c) => c.subjects)));

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Classes & Subjects" description="Manage class groups, sections, and subject assignments" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-6">

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard icon={faGraduationCap}     label="Total Classes"    value={CLASSES_DATA.length} />
              <StatCard icon={faUsers}             label="Total Sections"   value={totalSections} />
              <StatCard icon={faChalkboardTeacher} label="Total Students"   value={totalStudents} />
              <StatCard icon={faBookOpen}           label="Subjects Offered" value={allSubjects.length} />
            </div>

            {/* Table header */}
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-slate-800">All Classes</h2>
              <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white text-[13px] h-8 gap-1.5"
                onClick={() => setShowDialog(true)}>
                <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
                Add Class
              </Button>
            </div>

            {/* Column headers */}
            <div className="flex items-center px-5 gap-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wide -mb-3">
              <span className="min-w-[160px]">Class / Teacher</span>
              <span className="flex-1">Sections & Subjects</span>
              <span className="w-24 text-right pr-1">Students</span>
            </div>

            {/* Class list */}
            <div className="flex flex-col gap-2">
              {CLASSES_DATA.map((cls) => (
                <ClassCard key={cls.id} cls={cls} />
              ))}
            </div>

          </div>
        </main>
      </div>

      <AddClassDialog open={showDialog} onClose={() => setShowDialog(false)} />
    </div>
  );
}
