"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ── Data ─────────────────────────────────────────────────────────────────────

const EXAMS = [
  { id: "E001", name: "Unit Test 1",     term: "Term 1", session: "2024–25", startDate: "Oct 14, 2024", endDate: "Oct 18, 2024", classes: "Class 1–6", status: "Completed" },
  { id: "E002", name: "Half Yearly Exam",term: "Term 1", session: "2024–25", startDate: "Dec 9, 2024",  endDate: "Dec 16, 2024", classes: "Class 1–6", status: "Completed" },
  { id: "E003", name: "Unit Test 2",     term: "Term 2", session: "2024–25", startDate: "Mar 3, 2025",  endDate: "Mar 7, 2025",  classes: "Class 1–6", status: "Completed" },
  { id: "E004", name: "Annual Exam",     term: "Term 2", session: "2024–25", startDate: "May 5, 2025",  endDate: "May 15, 2025", classes: "Class 1–6", status: "Upcoming"  },
];

const RESULTS = [
  { student: "Priya Chatterjee", class: "Class 5", math: 92, english: 88, science: 85, social: 90, total: 355, avg: 88.75, grade: "A+", position: 1 },
  { student: "Tanya Roy",        class: "Class 5", math: 88, english: 84, science: 90, social: 87, total: 349, avg: 87.25, grade: "A+", position: 2 },
  { student: "Arjun Mukherjee",  class: "Class 6", math: 78, english: 82, science: 79, social: 76, total: 315, avg: 78.75, grade: "A",  position: 4 },
  { student: "Sneha Banerjee",   class: "Class 4", math: 65, english: 70, science: 68, social: 72, total: 275, avg: 68.75, grade: "B",  position: 7 },
  { student: "Akash Ghosh",      class: "Class 2", math: 95, english: 91, science: 88, social: 93, total: 367, avg: 91.75, grade: "A+", position: 1 },
];

const GRADING = [
  { grade: "A+", range: "90–100", remark: "Outstanding"    },
  { grade: "A",  range: "75–89",  remark: "Excellent"       },
  { grade: "B+", range: "65–74",  remark: "Very Good"       },
  { grade: "B",  range: "55–64",  remark: "Good"            },
  { grade: "C",  range: "45–54",  remark: "Average"         },
  { grade: "D",  range: "33–44",  remark: "Below Average"   },
  { grade: "F",  range: "0–32",   remark: "Fail"            },
];

const statusCls: Record<string, string> = {
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Upcoming:  "bg-blue-50 text-blue-700 border-blue-200",
};

const gradeCls: Record<string, string> = {
  "A+": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "A":  "bg-blue-50 text-blue-700 border-blue-200",
  "B+": "bg-violet-50 text-violet-700 border-violet-200",
  "B":  "bg-amber-50 text-amber-700 border-amber-200",
  "C":  "bg-orange-50 text-orange-700 border-orange-200",
  "D":  "bg-red-50 text-red-700 border-red-200",
  "F":  "bg-slate-100 text-slate-500 border-slate-200",
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ExamsPage() {
  const [tab, setTab] = useState("exams");

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Exams",       value: EXAMS.length },
            { label: "Completed",          value: EXAMS.filter((e) => e.status === "Completed").length },
            { label: "Upcoming",           value: EXAMS.filter((e) => e.status === "Upcoming").length },
            { label: "Results Published",  value: RESULTS.length },
          ].map((st) => (
            <Card key={st.label} className="shadow-none border-slate-200">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-slate-900">{st.value}</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{st.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-slate-100 h-8">
            <TabsTrigger value="exams"   className="text-[12px] h-6">Exams</TabsTrigger>
            <TabsTrigger value="results" className="text-[12px] h-6">Results</TabsTrigger>
            <TabsTrigger value="grading" className="text-[12px] h-6">Grading Scale</TabsTrigger>
          </TabsList>
          {/* Exams tab */}
          <TabsContent value="exams" className="mt-4">
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[14px] font-semibold">Exam Schedule</CardTitle>
                  <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white text-[13px] h-8 gap-1.5">
                    <FontAwesomeIcon icon={faPlus} className="text-[12px]" />
                    Schedule Exam
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      {["ID", "Exam Name", "Term", "Session", "Start Date", "End Date", "Classes", "Status"].map((h) => (
                        <TableHead
                          key={h}
                          className={`text-[11px] font-semibold uppercase text-slate-500 ${h === "ID" ? "pl-6" : ""} ${h === "Status" ? "pr-6" : ""}`}
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {EXAMS.map((e) => (
                      <TableRow key={e.id} className="hover:bg-slate-50 border-slate-100">
                        <TableCell className="text-[12px] text-slate-400 font-mono pl-6">{e.id}</TableCell>
                        <TableCell className="text-[13px] font-medium text-slate-900">{e.name}</TableCell>
                        <TableCell className="text-[13px] text-slate-600">{e.term}</TableCell>
                        <TableCell className="text-[13px] text-slate-500">{e.session}</TableCell>
                        <TableCell className="text-[13px] text-slate-600">{e.startDate}</TableCell>
                        <TableCell className="text-[13px] text-slate-600">{e.endDate}</TableCell>
                        <TableCell className="text-[13px] text-slate-600">{e.classes}</TableCell>
                        <TableCell className="pr-6">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusCls[e.status]}`}>
                            {e.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Results tab */}
          <TabsContent value="results" className="mt-4">
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] font-semibold">Unit Test 2 Results (Sample)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      {["Student", "Class", "Math", "English", "Science", "Social", "Total", "Avg", "Grade", "Position"].map((h) => (
                        <TableHead
                          key={h}
                          className={`text-[11px] font-semibold uppercase text-slate-500 ${h === "Student" ? "pl-6" : ""} ${h === "Position" ? "pr-6" : ""}`}
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {RESULTS.map((r) => (
                      <TableRow key={r.student} className="hover:bg-slate-50 border-slate-100">
                        <TableCell className="text-[13px] font-medium text-slate-900 pl-6">{r.student}</TableCell>
                        <TableCell className="text-[13px] text-slate-600">{r.class}</TableCell>
                        <TableCell className="text-[13px] text-slate-700">{r.math}</TableCell>
                        <TableCell className="text-[13px] text-slate-700">{r.english}</TableCell>
                        <TableCell className="text-[13px] text-slate-700">{r.science}</TableCell>
                        <TableCell className="text-[13px] text-slate-700">{r.social}</TableCell>
                        <TableCell className="text-[13px] font-semibold text-slate-900">{r.total}</TableCell>
                        <TableCell className="text-[13px] text-slate-700">{r.avg}%</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${gradeCls[r.grade] ?? ""}`}>
                            {r.grade}
                          </span>
                        </TableCell>
                        <TableCell className="text-[13px] font-medium text-[#007BFF] pr-6">#{r.position}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Grading Scale tab */}
          <TabsContent value="grading" className="mt-4">
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] font-semibold">Grading Scale</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      {["Grade", "Marks Range", "Remark"].map((h) => (
                        <TableHead
                          key={h}
                          className={`text-[11px] font-semibold uppercase text-slate-500 ${h === "Grade" ? "pl-6" : ""} ${h === "Remark" ? "pr-6" : ""}`}
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {GRADING.map((g) => (
                      <TableRow key={g.grade} className="hover:bg-slate-50 border-slate-100">
                        <TableCell className="pl-6">
                          <span className={`inline-flex items-center px-3 py-0.5 rounded text-[12px] font-bold border ${gradeCls[g.grade] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                            {g.grade}
                          </span>
                        </TableCell>
                        <TableCell className="text-[13px] text-slate-700">{g.range}</TableCell>
                        <TableCell className="text-[13px] text-slate-600 pr-6">{g.remark}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
