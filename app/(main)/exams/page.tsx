"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { examsApi, type Exam, type ExamResult, type GradeRule } from "@/lib/api";

const statusCls: Record<string, string> = {
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Ongoing: "bg-amber-50 text-amber-700 border-amber-200",
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

const CLASS_OPTIONS = ["All Classes", "Nursery", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6"];

function toUiDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isoToDate(value: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function dateToIso(value?: Date): string {
  if (!value) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapMarksToColumns(marks: { subject: string; marks: number }[]) {
  const get = (name: string) => marks.find((m) => m.subject.toLowerCase() === name.toLowerCase())?.marks ?? 0;
  return {
    math: get("Mathematics") || get("Math"),
    english: get("English"),
    science: get("Science"),
    social: get("Social") || get("Social Studies"),
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ExamsPage() {
  const [tab, setTab] = useState("exams");
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [grading, setGrading] = useState<GradeRule[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("All Classes");
  const [examsLoading, setExamsLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [gradingLoading, setGradingLoading] = useState(true);
  const [savingGrading, setSavingGrading] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [savingExam, setSavingExam] = useState(false);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<string>("");
  const [gradingMessage, setGradingMessage] = useState<string>("");
  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const [examForm, setExamForm] = useState({
    name: "",
    term: "Term 1",
    session: "2026–27",
    start_date: "",
    end_date: "",
    classes: "Class 1–6",
    status: "Upcoming",
  });

  const loadExams = useCallback(async () => {
    setExamsLoading(true);
    try {
      const items = await examsApi.list();
      setExams(items);
      setSelectedExamId((prev) => {
        if (prev && items.some((e) => e.id === prev)) return prev;
        return items[0]?.id ?? "";
      });
    } catch {
      setExams([]);
      setSelectedExamId("");
    } finally {
      setExamsLoading(false);
    }
  }, []);

  const handleScheduleExam = async () => {
    if (!examForm.name || !examForm.term || !examForm.session || !examForm.start_date || !examForm.end_date || !examForm.classes) {
      return;
    }
    setSavingExam(true);
    try {
      const created = await examsApi.create(examForm);
      setSelectedExamId(created.id);
      await loadExams();
      setScheduleOpen(false);
      setExamForm({
        name: "",
        term: "Term 1",
        session: "2026–27",
        start_date: "",
        end_date: "",
        classes: "Class 1–6",
        status: "Upcoming",
      });
    } finally {
      setSavingExam(false);
    }
  };

  useEffect(() => {
    setGradingLoading(true);
    loadExams();
    examsApi.grading().then((g) => setGrading(g.rules)).catch(() => setGrading([])).finally(() => setGradingLoading(false));
  }, [loadExams]);

  useEffect(() => {
    if (!selectedExamId) {
      setResults([]);
      return;
    }
    setResultsLoading(true);
    examsApi.results(
      selectedExamId,
      selectedClass === "All Classes" ? undefined : selectedClass,
    ).then(setResults).catch(() => setResults([])).finally(() => setResultsLoading(false));
  }, [selectedExamId, selectedClass]);

  const handleCsvUpload = async (file?: File) => {
    if (!file || !selectedExamId) return;
    setUploadingCsv(true);
    setUploadSummary("");
    try {
      const summary = await examsApi.uploadResultsCsv(selectedExamId, file);
      setUploadSummary(`Inserted ${summary.inserted}, skipped ${summary.skipped}`);
      const fresh = await examsApi.results(
        selectedExamId,
        selectedClass === "All Classes" ? undefined : selectedClass,
      );
      setResults(fresh);
    } catch {
      setUploadSummary("CSV upload failed");
    } finally {
      setUploadingCsv(false);
      if (csvInputRef.current) csvInputRef.current.value = "";
    }
  };

  const handleGradeChange = (index: number, patch: Partial<GradeRule>) => {
    setGrading((prev) => prev.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
  };

  const handleSaveGrading = async () => {
    setSavingGrading(true);
    setGradingMessage("");
    try {
      const saved = await examsApi.saveGrading(grading);
      setGrading(saved.rules);
      setGradingMessage("Grading scale updated");

      if (selectedExamId) {
        const fresh = await examsApi.results(
          selectedExamId,
          selectedClass === "All Classes" ? undefined : selectedClass,
        );
        setResults(fresh);
      }
    } catch {
      setGradingMessage("Failed to update grading scale");
    } finally {
      setSavingGrading(false);
    }
  };

  const handlePrintResult = (result: ExamResult) => {
    const selectedExam = exams.find((e) => e.id === result.exam_id);
    const marksHtml = result.marks
      .map((m) => `<tr><td style="padding:6px;border:1px solid #e2e8f0;">${m.subject}</td><td style="padding:6px;border:1px solid #e2e8f0;text-align:right;">${m.marks}</td><td style="padding:6px;border:1px solid #e2e8f0;text-align:right;">${m.max_marks}</td></tr>`)
      .join("");

    const html = `
      <html>
        <head>
          <title>Student Result</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a;">
          <h2 style="margin: 0 0 8px;">KDIAE - Student Result</h2>
          <p style="margin: 0 0 4px;"><strong>Exam:</strong> ${selectedExam?.name ?? result.exam_id}</p>
          <p style="margin: 0 0 4px;"><strong>Student:</strong> ${result.student_name}</p>
          <p style="margin: 0 0 4px;"><strong>Student ID:</strong> ${result.student_id || "-"}</p>
          <p style="margin: 0 0 4px;"><strong>Class:</strong> ${result.class_name}</p>
          <p style="margin: 0 0 12px;"><strong>Grade:</strong> ${result.grade || "-"} | <strong>Percentage:</strong> ${result.percentage}%</p>
          <table style="border-collapse: collapse; width: 100%; margin-bottom: 12px;">
            <thead>
              <tr>
                <th style="padding:6px;border:1px solid #e2e8f0;text-align:left;">Subject</th>
                <th style="padding:6px;border:1px solid #e2e8f0;text-align:right;">Marks</th>
                <th style="padding:6px;border:1px solid #e2e8f0;text-align:right;">Max</th>
              </tr>
            </thead>
            <tbody>${marksHtml}</tbody>
          </table>
          <p style="margin:0;"><strong>Total:</strong> ${result.total}</p>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <>
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Exam</DialogTitle>
            <DialogDescription>Create a new exam in the schedule.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-1">
            <Input
              placeholder="Exam name"
              value={examForm.name}
              onChange={(e) => setExamForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Term"
                value={examForm.term}
                onChange={(e) => setExamForm((prev) => ({ ...prev, term: e.target.value }))}
              />
              <Input
                placeholder="Session"
                value={examForm.session}
                onChange={(e) => setExamForm((prev) => ({ ...prev, session: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white text-[13px] text-slate-700 hover:bg-slate-50 transition-colors">
                    <span className={examForm.start_date ? "text-slate-700" : "text-slate-400"}>
                      {examForm.start_date ? format(isoToDate(examForm.start_date)!, "MMM d, yyyy") : "Start date"}
                    </span>
                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={isoToDate(examForm.start_date)}
                    onSelect={(date) => setExamForm((prev) => ({ ...prev, start_date: dateToIso(date) }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white text-[13px] text-slate-700 hover:bg-slate-50 transition-colors">
                    <span className={examForm.end_date ? "text-slate-700" : "text-slate-400"}>
                      {examForm.end_date ? format(isoToDate(examForm.end_date)!, "MMM d, yyyy") : "End date"}
                    </span>
                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={isoToDate(examForm.end_date)}
                    onSelect={(date) => setExamForm((prev) => ({ ...prev, end_date: dateToIso(date) }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Input
              placeholder="Classes (e.g. Class 1–6)"
              value={examForm.classes}
              onChange={(e) => setExamForm((prev) => ({ ...prev, classes: e.target.value }))}
            />
            <Select
              value={examForm.status}
              onValueChange={(v) => setExamForm((prev) => ({ ...prev, status: v }))}
            >
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
                <SelectItem value="Ongoing">Ongoing</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)} disabled={savingExam}>Cancel</Button>
            <Button className="bg-[#007BFF] hover:bg-[#0069d9]" onClick={handleScheduleExam} disabled={savingExam}>
              {savingExam ? "Saving..." : "Save Exam"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Exams",       value: exams.length },
            { label: "Completed",          value: exams.filter((e) => e.status === "Completed").length },
            { label: "Upcoming",           value: exams.filter((e) => e.status === "Upcoming").length },
            { label: "Results Published",  value: results.length },
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
            <Card className="shadow-none border-slate-200 pb-0">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[14px] font-semibold">Exam Schedule</CardTitle>
                  <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white text-[13px] h-8 gap-1.5" onClick={() => setScheduleOpen(true)}>
                    <FontAwesomeIcon icon={faPlus} className="text-[12px]" />
                    Schedule Exam
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {examsLoading ? (
                  <div className="px-6 pb-6 space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={`exam-skel-${i}`} className="h-10 w-full" />
                    ))}
                  </div>
                ) : exams.length === 0 ? (
                  <div className="px-6 pb-8 pt-2 flex flex-col items-center justify-center text-center gap-3 text-slate-500">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="text-slate-400">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <line x1="16" y1="3" x2="16" y2="7" />
                        <line x1="8" y1="3" x2="8" y2="7" />
                        <line x1="3" y1="11" x2="21" y2="11" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-700">No exams scheduled yet</p>
                      <p className="text-[12px] text-slate-500 mt-0.5">Click “Schedule Exam” to create your first exam.</p>
                    </div>
                  </div>
                ) : (
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
                      {exams.map((e) => (
                        <TableRow key={e.id} className="hover:bg-slate-50 border-slate-100">
                          <TableCell className="text-[12px] text-slate-400 font-mono pl-6">{e.id}</TableCell>
                          <TableCell className="text-[13px] font-medium text-slate-900">{e.name}</TableCell>
                          <TableCell className="text-[13px] text-slate-600">{e.term}</TableCell>
                          <TableCell className="text-[13px] text-slate-500">{e.session}</TableCell>
                          <TableCell className="text-[13px] text-slate-600">{toUiDate(e.start_date)}</TableCell>
                          <TableCell className="text-[13px] text-slate-600">{toUiDate(e.end_date)}</TableCell>
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Results tab */}
          <TabsContent value="results" className="mt-4">
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                  <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                    <SelectTrigger className="w-56 bg-white border-slate-200 text-[13px] h-8">
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((e) => (
                        <SelectItem key={e.id} value={e.id} className="text-[13px]">
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-44 bg-white border-slate-200 text-[13px] h-8">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c} className="text-[13px]">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={csvInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(e) => handleCsvUpload(e.target.files?.[0])}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[12px] h-8"
                      disabled={!selectedExamId || uploadingCsv}
                      onClick={() => csvInputRef.current?.click()}
                    >
                      {uploadingCsv ? "Uploading..." : "Upload CSV"}
                    </Button>
                  </div>
                </div>
                {uploadSummary ? <p className="text-[12px] text-slate-500 mt-2">{uploadSummary}</p> : null}
              </CardHeader>
              <CardContent className="p-0">
                {resultsLoading ? (
                  <div className="px-6 pb-6 space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={`result-skel-${i}`} className="h-10 w-full" />
                    ))}
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-6 pb-8 pt-2 flex flex-col items-center justify-center text-center gap-3 text-slate-500">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="text-slate-400">
                        <path d="M4 5h16" />
                        <path d="M6 5v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5" />
                        <path d="M9 10h6" />
                        <path d="M9 14h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-700">No results published yet</p>
                      <p className="text-[12px] text-slate-500 mt-0.5">Results will appear here once marks are entered for an exam.</p>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        {["Student", "Class", "Math", "English", "Science", "Social", "Total", "Avg", "Grade", "Position", "Action"].map((h) => (
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
                      {results.map((r, idx) => {
                        const mapped = mapMarksToColumns(r.marks);
                        return (
                        <TableRow key={r.id} className="hover:bg-slate-50 border-slate-100">
                          <TableCell className="text-[13px] font-medium text-slate-900 pl-6">{r.student_name}</TableCell>
                          <TableCell className="text-[13px] text-slate-600">{r.class_name}</TableCell>
                          <TableCell className="text-[13px] text-slate-700">{mapped.math}</TableCell>
                          <TableCell className="text-[13px] text-slate-700">{mapped.english}</TableCell>
                          <TableCell className="text-[13px] text-slate-700">{mapped.science}</TableCell>
                          <TableCell className="text-[13px] text-slate-700">{mapped.social}</TableCell>
                          <TableCell className="text-[13px] font-semibold text-slate-900">{r.total}</TableCell>
                          <TableCell className="text-[13px] text-slate-700">{r.percentage}%</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${gradeCls[r.grade] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                              {r.grade || "-"}
                            </span>
                          </TableCell>
                          <TableCell className="text-[13px] font-medium text-[#007BFF] pr-6">#{idx + 1}</TableCell>
                          <TableCell className="pr-6">
                            <Button size="sm" variant="outline" className="h-7 text-[12px]" onClick={() => handlePrintResult(r)}>
                              Print
                            </Button>
                          </TableCell>
                        </TableRow>
                      )})}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Grading Scale tab */}
          <TabsContent value="grading" className="mt-4">
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[14px] font-semibold">Grading Scale</CardTitle>
                  <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white text-[12px] h-8" onClick={handleSaveGrading} disabled={savingGrading || gradingLoading}>
                    {savingGrading ? "Saving..." : "Save Grading"}
                  </Button>
                </div>
                {gradingMessage ? <p className="text-[12px] text-slate-500 mt-2">{gradingMessage}</p> : null}
              </CardHeader>
              <CardContent className="p-0">
                {gradingLoading ? (
                  <div className="px-6 pb-6 space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={`grading-skel-${i}`} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
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
                      {grading.map((g, idx) => (
                        <TableRow key={g.grade} className="hover:bg-slate-50 border-slate-100">
                          <TableCell className="pl-6">
                            <span className={`inline-flex items-center px-3 py-0.5 rounded text-[12px] font-bold border ${gradeCls[g.grade] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                              {g.grade}
                            </span>
                          </TableCell>
                          <TableCell className="text-[13px] text-slate-700">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={g.min_pct}
                                onChange={(e) => handleGradeChange(idx, { min_pct: Number(e.target.value || 0) })}
                                className="h-8 w-20 text-[12px]"
                              />
                              <span>–</span>
                              <Input
                                type="number"
                                value={g.max_pct}
                                onChange={(e) => handleGradeChange(idx, { max_pct: Number(e.target.value || 0) })}
                                className="h-8 w-20 text-[12px]"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-[13px] text-slate-600 pr-6">
                            <Input
                              value={g.remark}
                              onChange={(e) => handleGradeChange(idx, { remark: e.target.value })}
                              className="h-8 text-[12px]"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
