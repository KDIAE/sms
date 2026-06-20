"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass, faPlus, faTrash, faChevronDown, faChevronUp,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { studentsApi, classesApi, type Student } from "@/lib/api";
import { AddStudentWizard } from "@/components/students/AddStudentWizard";
import { StudentExpandPanel } from "@/components/students/StudentExpandPanel";
import { feeVariant } from "@/components/students/constants";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsPage() {
  const [students, setStudents]       = useState<Student[]>([]);
  const [stats, setStats]             = useState({ total: 0, fee_paid: 0, fee_issues: 0, low_attendance: 0 });
  const [classesList, setClassesList] = useState<string[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterFee, setFilterFee]     = useState("All");
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [showWizard, setShowWizard]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes, classesRes] = await Promise.all([
        studentsApi.list({
          search:     search     || undefined,
          class_name: filterClass !== "All" ? filterClass : undefined,
          fee:        filterFee   !== "All" ? filterFee   : undefined,
          limit: 200,
        }),
        studentsApi.stats(),
        classesApi.list(),
      ]);
      setStudents(res.data);
      setStats(statsRes);
      setClassesList(classesRes.map((c) => c.name));
    } finally {
      setLoading(false);
    }
  }, [search, filterClass, filterFee]);

  useEffect(() => {
    const handle = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(handle);
  }, [load]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this student? This cannot be undone.")) return;
    await studentsApi.delete(id);
    setStudents((p) => p.filter((s) => s.id !== id));
    setStats((p) => ({ ...p, total: p.total - 1 }));
  };

  const handleUpdated = (updated: Student) =>
    setStudents((p) => p.map((s) => (s.id === updated.id ? updated : s)));

  const classFilterOptions = Array.from(new Set(students.map((s) => s.class_name))).filter(Boolean).sort();

  return (
    <>
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Students",       value: stats.total },
            { label: "Fee Paid",             value: stats.fee_paid },
            { label: "Partial / Unpaid",     value: stats.fee_issues },
            { label: "Below 75% Attendance", value: stats.low_attendance },
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-[14px] font-semibold">All Students</CardTitle>
              <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white text-[13px] h-9 sm:h-8 gap-2 w-full sm:w-auto"
                onClick={() => setShowWizard(true)}>
                <FontAwesomeIcon icon={faPlus} className="text-[11px]" /> Add Student
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
              <div className="relative w-full sm:flex-1 sm:max-w-[260px]">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]" />
                <Input placeholder="Search by name or ID…" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 bg-slate-50 border-slate-200 text-[13px] h-8" />
              </div>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-full sm:w-[140px] bg-slate-50 border-slate-200 text-[13px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Classes</SelectItem>
                  {classFilterOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterFee} onValueChange={setFilterFee}>
                <SelectTrigger className="w-full sm:w-[130px] bg-slate-50 border-slate-200 text-[13px] h-8"><SelectValue /></SelectTrigger>
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
            {loading ? (
              <>
                <div className="md:hidden p-3 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border-slate-100 shadow-none">
                      <CardContent className="p-3 space-y-2.5">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-2 w-28 rounded-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="hidden md:block">
                  <Table>
                    <TableBody>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <TableRow key={i} className="border-slate-100">
                          <TableCell className="pl-6"><Skeleton className="h-3.5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-3.5 w-36" /></TableCell>
                          <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-3.5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-2 w-20 rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                          <TableCell />
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                <FontAwesomeIcon icon={faUsers} className="text-3xl mb-1" />
                <p className="text-[13px]">No students found.</p>
              </div>
            ) : (
              <>
                <div className="md:hidden p-3 space-y-3">
                  {students.map((s) => {
                    const isOpen = expandedId === s.id;
                    return (
                      <div key={s.id} className="rounded-lg border border-slate-100 bg-white overflow-hidden">
                        <button
                          type="button"
                          className="w-full p-3 text-left"
                          onClick={() => setExpandedId(isOpen ? null : s.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] text-slate-400 font-mono truncate">{s.student_code}</p>
                              <p className="text-[14px] font-semibold text-slate-900 truncate mt-0.5">{s.name}</p>
                              <p className="text-[12px] text-slate-600 mt-1">{s.class_name}{s.section ? ` – ${s.section}` : ""}</p>
                            </div>
                            <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="text-[11px] text-slate-400 mt-1" />
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between gap-3 text-[12px]">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${feeVariant[s.fees?.fee_status ?? "Paid"] ?? feeVariant["Paid"]}`}>
                                {s.fees?.fee_status ?? "Paid"}
                              </span>
                              <span className="text-slate-500">{s.gender}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={s.attendance} className="h-1.5 flex-1" />
                              <span className={`text-[12px] font-medium ${s.attendance < 75 ? "text-red-600" : "text-slate-700"}`}>
                                {s.attendance}%
                              </span>
                            </div>
                            <div className="text-[12px] text-slate-600">
                              <p className="font-medium text-slate-700">{s.guardian?.name}</p>
                              <p className="text-slate-400">{s.guardian?.relation} · {s.guardian?.phone}</p>
                            </div>
                            {s.admission_date && (
                              <p className="text-[11px] text-slate-400 mt-1">Admitted: {new Date(s.admission_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                            )}
                          </div>
                        </button>

                        <div className="flex items-center justify-end gap-1 px-3 pb-3">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={(e) => handleDelete(s.id, e)}>
                            <FontAwesomeIcon icon={faTrash} className="text-[12px]" />
                          </Button>
                        </div>

                        {isOpen && (
                          <StudentExpandPanel
                            key={`${s.id}-expand-mobile`}
                            mobile
                            s={s}
                            classesList={classesList}
                            existingCodes={students.filter((x) => x.id !== s.id).map((x) => x.student_code)}
                            onClose={() => setExpandedId(null)}
                            onUpdated={handleUpdated}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="hidden md:block">
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
                          { h: "Phone" },
                          { h: "Admitted" },
                          { h: "",            cls: "w-10 pr-4" },
                        ].map(({ h, cls = "" }, i) => (
                          <TableHead key={i} className={`text-[11px] font-semibold uppercase text-slate-500 ${cls}`}>{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s) => {
                        const isOpen = expandedId === s.id;
                        return (
                          <Fragment key={s.id}>
                            <TableRow
                              className="hover:bg-slate-50 border-slate-100 cursor-pointer select-none"
                              onClick={() => setExpandedId(isOpen ? null : s.id)}>
                              <TableCell className="text-[12px] text-slate-400 font-mono pl-6">{s.student_code}</TableCell>
                              <TableCell className="text-[13px] font-medium text-slate-900">{s.name}</TableCell>
                              <TableCell className="text-[13px] text-slate-600">{s.class_name}{s.section ? ` – ${s.section}` : ""}</TableCell>
                              <TableCell className="text-[13px] text-slate-600">{s.gender}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${feeVariant[s.fees?.fee_status ?? "Paid"] ?? feeVariant["Paid"]}`}>
                                  {s.fees?.fee_status ?? "Paid"}
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
                              <TableCell className="text-[13px] text-slate-500">{s.guardian?.phone}</TableCell>
                              <TableCell className="text-[13px] text-slate-500">{s.admission_date ? new Date(s.admission_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</TableCell>
                              <TableCell className="pr-4 w-10" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-red-500"
                                    onClick={(e) => handleDelete(s.id, e)}>
                                    <FontAwesomeIcon icon={faTrash} className="text-[12px]" />
                                  </Button>
                                  <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown}
                                    className="text-[11px] text-slate-300 ml-1 pointer-events-none" />
                                </div>
                              </TableCell>
                            </TableRow>
                            {isOpen && (
                              <StudentExpandPanel
                                key={`${s.id}-expand`}
                                s={s}
                                classesList={classesList}
                                existingCodes={students.filter((x) => x.id !== s.id).map((x) => x.student_code)}
                                onClose={() => setExpandedId(null)}
                                onUpdated={handleUpdated}
                              />
                            )}
                          </Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AddStudentWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        classesList={classesList}
        onCreated={(s) => {
          setStudents((p) => [s, ...p]);
          setStats((p) => ({ ...p, total: p.total + 1 }));
        }}
      />
    </>
  );
}
