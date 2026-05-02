"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass, faPlus, faChevronDown, faChevronUp, faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { admissionsApi, classesApi, type Admission } from "@/lib/api";
import { AddApplicationWizard } from "@/components/admissions/AddApplicationWizard";
import { AdmissionExpandPanel } from "@/components/admissions/AdmissionExpandPanel";
import { StatusBadge } from "@/components/admissions/StatusBadge";
import { ALL_STATUSES, CLASS_LIST } from "@/components/admissions/constants";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdmissionsPage() {
  const [apps, setApps] = useState<Admission[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, under_review: 0, approved: 0, rejected: 0, enrolled: 0 });

  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classFilter, setClassFilter]   = useState("");
  const [page] = useState(1);

  const [loading, setLoading]         = useState(false);
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [wizardOpen, setWizardOpen]   = useState(false);
  const [classesList, setClassesList] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes, classesRes] = await Promise.all([
        admissionsApi.list({ search, status: statusFilter, class_name: classFilter, page, limit: 100 }),
        admissionsApi.stats(),
        classesApi.list(),
      ]);
      setApps(listRes.data);
      setStats(statsRes);
      setClassesList(classesRes.map((c) => c.name));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, classFilter, page]);

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(handle);
  }, [fetchData]);

  const allClassOptions = classesList.length > 0 ? classesList : CLASS_LIST;

  const statCards = [
    { label: "Total",        value: stats.total,        color: "text-slate-800"   },
    { label: "Pending",      value: stats.pending,      color: "text-amber-700"   },
    { label: "Under Review", value: stats.under_review, color: "text-blue-700"    },
    { label: "Approved",     value: stats.approved,     color: "text-emerald-700" },
    { label: "Rejected",     value: stats.rejected,     color: "text-red-700"     },
    { label: "Enrolled",     value: stats.enrolled,     color: "text-violet-700"  },
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-bold text-slate-900">Admissions</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Manage applications and enrol new students</p>
        </div>
        <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-[13px] h-9 sm:h-8 px-4 gap-2 w-full sm:w-auto"
          onClick={() => setWizardOpen(true)}>
          <FontAwesomeIcon icon={faPlus} />
          New Application
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map((c) => (
          <Card key={c.label}
            className="border-slate-100 shadow-none cursor-pointer hover:border-slate-300 transition-colors"
            onClick={() => setStatusFilter(statusFilter === c.label || c.label === "Total" ? "" : c.label)}>
            <CardContent className="px-4 py-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase mb-1">{c.label}</p>
              <p className={`text-[20px] sm:text-[24px] font-bold ${c.color}`}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-slate-100 shadow-none py-0 gap-0">
        <CardHeader className="p-4 border-b border-slate-100 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-[14px] font-semibold text-slate-800">
            Applications
            <span className="ml-2 text-[12px] font-normal text-slate-500">({apps.length} showing)</span>
          </CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:flex-1 sm:min-w-[220px]">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[12px]" />
              <Input placeholder="Search by name, code or phone…" className="pl-8 h-8 text-[13px] bg-slate-50 border-slate-200"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <Select value={statusFilter || "__all__"} onValueChange={(v) => setStatusFilter(v === "__all__" ? "" : v)}>
              <SelectTrigger className="h-8 text-[13px] border-slate-200 bg-slate-50 w-full sm:w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Statuses</SelectItem>
                {ALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={classFilter || "__all__"} onValueChange={(v) => setClassFilter(v === "__all__" ? "" : v)}>
              <SelectTrigger className="h-8 text-[13px] border-slate-200 bg-slate-50 w-full sm:w-[160px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Classes</SelectItem>
                {allClassOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            {(statusFilter || classFilter || search) && (
              <Button variant="ghost" size="sm" className="h-8 text-[12px] text-slate-500 justify-start sm:justify-center"
                onClick={() => { setSearch(""); setStatusFilter(""); setClassFilter(""); }}>
                <FontAwesomeIcon icon={faXmark} className="mr-1" /> Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden p-3 space-y-3">
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-slate-100 shadow-none">
                <CardContent className="p-3 space-y-2.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </CardContent>
              </Card>
            ))}

            {!loading && apps.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-[13px]">No applications found.</div>
            )}

            {!loading && apps.map((a) => {
              const isOpen = expandedId === a.id;
              return (
                <div key={a.id} className="rounded-lg border border-slate-100 bg-white overflow-hidden">
                  <button
                    type="button"
                    className="w-full p-3 text-left"
                    onClick={() => setExpandedId(isOpen ? null : a.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-mono truncate">{a.application_code}</p>
                        <p className="text-[14px] font-semibold text-slate-900 truncate mt-0.5">{a.applicant_name}</p>
                      </div>
                      <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="text-slate-400 text-[11px] mt-1" />
                    </div>
                    <div className="mt-2 flex flex-col gap-1.5 text-[12px] text-slate-600">
                      <p>
                        {a.applying_for_class}{a.section_preference ? ` – ${a.section_preference}` : ""}
                        {a.academic_year ? <span className="ml-1 text-[11px] text-slate-400">({a.academic_year})</span> : null}
                      </p>
                      <p>{a.guardian?.phone || a.phone || "—"}</p>
                      <p className="text-slate-500">{a.applied_date ? format(new Date(a.applied_date), "dd MMM yyyy") : "—"}</p>
                      <div className="pt-0.5"><StatusBadge status={a.status} /></div>
                    </div>
                  </button>

                  {isOpen && (
                    <AdmissionExpandPanel
                      key={`exp-mobile-${a.id}`}
                      mobile
                      app={a}
                      classesList={allClassOptions}
                      onSaved={(updated) => {
                        setApps((prev) => prev.map((x) => x.id === updated.id ? updated : x));
                        fetchData();
                      }}
                      onDeleted={(id) => {
                        setApps((prev) => prev.filter((x) => x.id !== id));
                        setExpandedId(null);
                        fetchData();
                      }}
                      onEnrolled={() => { fetchData(); setExpandedId(null); }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden md:block">
            <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/60">
                <TableHead className="text-[11px] font-semibold text-slate-500 pl-6 w-[100px]">Code</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-500">Name</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-500">Applying For</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-500">Guardian Phone</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-500">Applied</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-500">Status</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-500 w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="border-slate-100">
                  <TableCell className="pl-6"><Skeleton className="h-3.5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                  <TableCell />
                </TableRow>
              ))}
              {!loading && apps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400 text-[13px]">
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
              {!loading && apps.map((a) => {
                const isOpen = expandedId === a.id;
                return (
                  <Fragment key={a.id}>
                    <TableRow key={a.id}
                      className="hover:bg-slate-50 border-slate-100 cursor-pointer select-none"
                      onClick={() => setExpandedId(isOpen ? null : a.id)}>
                      <TableCell className="text-[12px] text-slate-400 font-mono pl-6">{a.application_code}</TableCell>
                      <TableCell className="text-[13px] font-medium text-slate-900">{a.applicant_name}</TableCell>
                      <TableCell className="text-[13px] text-slate-600">
                        {a.applying_for_class}{a.section_preference ? ` – ${a.section_preference}` : ""}
                        {a.academic_year ? <span className="ml-1 text-[11px] text-slate-400">({a.academic_year})</span> : null}
                      </TableCell>
                      <TableCell className="text-[13px] text-slate-600">
                        {a.guardian?.phone || a.phone || "—"}
                      </TableCell>
                      <TableCell className="text-[13px] text-slate-500">
                        {a.applied_date ? format(new Date(a.applied_date), "dd MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell><StatusBadge status={a.status} /></TableCell>
                      <TableCell className="pr-4">
                        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="text-slate-400 text-[11px]" />
                      </TableCell>
                    </TableRow>

                    {isOpen && (
                      <AdmissionExpandPanel
                        key={`exp-${a.id}`}
                        app={a}
                        classesList={allClassOptions}
                        onSaved={(updated) => {
                          setApps((prev) => prev.map((x) => x.id === updated.id ? updated : x));
                          fetchData();
                        }}
                        onDeleted={(id) => {
                          setApps((prev) => prev.filter((x) => x.id !== id));
                          setExpandedId(null);
                          fetchData();
                        }}
                        onEnrolled={() => { fetchData(); setExpandedId(null); }}
                      />
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddApplicationWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreated={() => { setWizardOpen(false); fetchData(); }}
        classesList={allClassOptions}
      />
    </div>
  );
}
